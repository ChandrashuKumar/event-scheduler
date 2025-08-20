'use client';

import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { Group } from '@/generated/prisma/client';

type Slot = {
  start: string;
  end: string;
};

type MeetingsMap = Record<string, Slot[]>;

export const useDashboardData = () => {
  const { user } = useAuth();
  const [leavingGroups, setLeavingGroups] = useState<Set<string>>(new Set());

  const fetcherWithToken = async (url: string, token: string | undefined) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  const { data: groupList = [], isLoading: groupsLoading } = useSWR(
    user ? ['/api/group/list', user] : null,
    async ([url, user]) => {
      const token = await user.getIdToken();
      return fetcherWithToken(url, token);
    }
  );

  const groups: Group[] = groupList;

  const { data: meetings = {}, isLoading: meetingLoading } = useSWR<Record<string, MeetingsMap>>(
    groups.length ? ['/api/availability/resolve', groups] : null,
    async () => {
      const token = await user?.getIdToken();
      const res = await fetch('/api/availability/resolve', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupIds: groups.map((g) => g.id) }),
      });
      if (!res.ok) throw new Error('Failed to fetch multi-group meetings');
      return res.json();
    }
  );

  const meetingData = useMemo(() => {
    const now = new Date();
    const today = new Date();
    const dayOfWeek = today.getDay();

    const remainingDays = Array.from({ length: 7 - dayOfWeek }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    // Build merged map from all groups
    const slotMap: Record<string, { start: string; end: string; group: string }[]> = {};

    Object.entries(meetings).forEach(([groupId, dateMap]) => {
      const groupName = groups.find((g) => g.id === groupId)?.name || 'Unknown Group';
      Object.values(dateMap)
        .flat()
        .forEach((slot) => {
          if (new Date(slot.start) <= now) return;
          const dateKey = format(new Date(slot.start), 'yyyy-MM-dd');
          if (!slotMap[dateKey]) slotMap[dateKey] = [];
          slotMap[dateKey].push({ ...slot, group: groupName });
        });
    });

    return remainingDays.map((date) => {
      const key = format(date, 'yyyy-MM-dd');
      const slots = slotMap[key] || [];
      return {
        date: format(date, 'EEE dd MMM'),
        count: slots.length,
        slots,
      };
    });
  }, [meetings, groups]);

  const upcomingSlots = useMemo(() => {
    const now = new Date();

    return Object.values(meetings).flatMap((groupSlots) =>
      Object.values(groupSlots)
        .flat()
        .filter((slot) => new Date(slot.start) > now)
    );
  }, [meetings]);

  const upcomingDaysWithMeetings = useMemo(() => {
    const uniqueDates = new Set(
      upcomingSlots.map((slot) => format(new Date(slot.start), 'yyyy-MM-dd'))
    );
    return uniqueDates.size;
  }, [upcomingSlots]);

  const ongoingMeetings = useMemo(() => {
    const now = new Date();
    
    const ongoing: Array<{ start: string; end: string; group: string }> = [];
    
    Object.entries(meetings).forEach(([groupId, dateMap]) => {
      const groupName = groups.find((g) => g.id === groupId)?.name || 'Unknown Group';
      Object.values(dateMap)
        .flat()
        .forEach((slot) => {
          const slotStart = new Date(slot.start);
          const slotEnd = new Date(slot.end);
          
          // Check if meeting is currently ongoing
          if (slotStart <= now && now <= slotEnd) {
            ongoing.push({ ...slot, group: groupName });
          }
        });
    });
    
    return ongoing;
  }, [meetings, groups]);

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    setLeavingGroups(prev => new Set(prev).add(groupId));
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/group/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Left group: ${groupName}`);
        mutate(['/api/group/list', user]);
      } else {
        toast.error(result.error || 'Failed to leave group.');
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLeavingGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  return {
    groups,
    groupsLoading,
    meetings,
    meetingLoading,
    meetingData,
    upcomingSlots,
    upcomingDaysWithMeetings,
    ongoingMeetings,
    leavingGroups,
    handleLeaveGroup,
  };
};
'use client';

import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { Group } from '@/generated/prisma/client';

type Slot = {
  start: string;
  end: string;
};

type MeetingsMap = Record<string, Slot[]>;

export type WeekOption = 'this-week' | 'next-week';

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

  const getWeekData = useMemo(() => {
    return (weekOption: WeekOption) => {
      const now = new Date();
      const today = new Date();
      
      let weekStart: Date;
      let weekEnd: Date;
      
      if (weekOption === 'this-week') {
        weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
        weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
      } else {
        const nextWeek = addWeeks(today, 1);
        weekStart = startOfWeek(nextWeek, { weekStartsOn: 1 });
        weekEnd = endOfWeek(nextWeek, { weekStartsOn: 1 });
      }

      // For "this week", only include remaining days
      const startDate = weekOption === 'this-week' && today > weekStart ? today : weekStart;
      
      const daysInRange: Date[] = [];
      const current = new Date(startDate);
      while (current <= weekEnd) {
        daysInRange.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      // Build merged map from all groups
      const slotMap: Record<string, { start: string; end: string; group: string }[]> = {};

      Object.entries(meetings).forEach(([groupId, dateMap]) => {
        const groupName = groups.find((g) => g.id === groupId)?.name || 'Unknown Group';
        Object.values(dateMap)
          .flat()
          .forEach((slot) => {
            const slotDate = new Date(slot.start);
            // Filter by week range and future slots only
            if (slotDate <= now || slotDate < weekStart || slotDate > weekEnd) return;
            const dateKey = format(slotDate, 'yyyy-MM-dd');
            if (!slotMap[dateKey]) slotMap[dateKey] = [];
            slotMap[dateKey].push({ ...slot, group: groupName });
          });
      });

      return daysInRange.map((date) => {
        const key = format(date, 'yyyy-MM-dd');
        const slots = slotMap[key] || [];
        return {
          date: format(date, 'EEE dd MMM'),
          count: slots.length,
          slots,
        };
      });
    };
  }, [meetings, groups]);

  const meetingData = useMemo(() => getWeekData('this-week'), [getWeekData]);

  const getWeekSlots = useMemo(() => {
    return (weekOption: WeekOption) => {
      const now = new Date();
      const today = new Date();
      
      let weekStart: Date;
      let weekEnd: Date;
      
      if (weekOption === 'this-week') {
        weekStart = startOfWeek(today, { weekStartsOn: 1 });
        weekEnd = endOfWeek(today, { weekStartsOn: 1 });
      } else {
        const nextWeek = addWeeks(today, 1);
        weekStart = startOfWeek(nextWeek, { weekStartsOn: 1 });
        weekEnd = endOfWeek(nextWeek, { weekStartsOn: 1 });
      }

      return Object.values(meetings).flatMap((groupSlots) =>
        Object.values(groupSlots)
          .flat()
          .filter((slot) => {
            const slotDate = new Date(slot.start);
            return slotDate > now && slotDate >= weekStart && slotDate <= weekEnd;
          })
      );
    };
  }, [meetings]);

  const getWeekDaysWithMeetings = useMemo(() => {
    return (weekOption: WeekOption) => {
      const slots = getWeekSlots(weekOption);
      const uniqueDates = new Set(
        slots.map((slot) => format(new Date(slot.start), 'yyyy-MM-dd'))
      );
      return uniqueDates.size;
    };
  }, [getWeekSlots]);

  const upcomingSlots = useMemo(() => getWeekSlots('this-week'), [getWeekSlots]);

  const upcomingDaysWithMeetings = useMemo(() => getWeekDaysWithMeetings('this-week'), [getWeekDaysWithMeetings]);

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
    getWeekData,
    getWeekSlots,
    getWeekDaysWithMeetings,
  };
};
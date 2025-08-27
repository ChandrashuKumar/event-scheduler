'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [leavingGroups, setLeavingGroups] = useState<Set<string>>(new Set());

  const { data: groupList, isLoading: groupsLoading, error: groupsError } = useQuery({
    queryKey: ['groups', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      const token = await user.getIdToken();
      const res = await fetch('/api/group/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to fetch groups');
      }
      return res.json();
    },
    enabled: !!user,
  });

  // Handle groups error
  if (groupsError) {
    toast.error(`Failed to load groups: ${groupsError.message}`);
  }

  const groups: Group[] = groupList || [];

  const { data: meetings, isLoading: meetingLoading, error: meetingsError } = useQuery<Record<string, MeetingsMap>>({
    queryKey: ['meetings', groups.map((g) => g.id).sort()],
    queryFn: async () => {
      if (!user) throw new Error('No user');
      const token = await user.getIdToken();
      const res = await fetch('/api/availability/resolve', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupIds: groups.map((g) => g.id) }),
      });
      if (!res.ok){
        const result = await res.json();
        throw new Error(result.error || 'Failed to fetch meetings');
      }
      return res.json();
    },
    enabled: !!user && groups.length > 0,
  });

  // Handle meetings error
  if (meetingsError) {
    toast.error(`Failed to load meetings: ${meetingsError.message}`);
  }

  const meetingsData = meetings || {};

  const getWeekData = (weekOption: WeekOption) => {
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

    Object.entries(meetingsData).forEach(([groupId, dateMap]) => {
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

  const meetingData = getWeekData('this-week');

  const getWeekSlots = (weekOption: WeekOption) => {
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

    return Object.values(meetingsData).flatMap((groupSlots) =>
      Object.values(groupSlots)
        .flat()
        .filter((slot) => {
          const slotDate = new Date(slot.start);
          return slotDate > now && slotDate >= weekStart && slotDate <= weekEnd;
        })
    );
  };

  const getWeekDaysWithMeetings = (weekOption: WeekOption) => {
    const slots = getWeekSlots(weekOption);
    const uniqueDates = new Set(slots.map((slot) => format(new Date(slot.start), 'yyyy-MM-dd')));
    return uniqueDates.size;
  };

  const upcomingSlots = getWeekSlots('this-week');

  const upcomingDaysWithMeetings = getWeekDaysWithMeetings('this-week');

  const getOngoingMeetings = () => {
    const now = new Date();

    const ongoing: Array<{ start: string; end: string; group: string }> = [];

    Object.entries(meetingsData).forEach(([groupId, dateMap]) => {
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
  };

  const ongoingMeetings = getOngoingMeetings();

  const leaveGroupMutation = useMutation({
    mutationFn: async ({ groupId, token }: { groupId: string; token: string }) => {
      const res = await fetch('/api/group/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to leave group.');
      }
      return result;
    },
    onSuccess: (_, { groupId }) => {
      // Invalidate and refetch groups
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setLeavingGroups((prev) => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    },
    onError: (error: Error, { groupId }) => {
      toast.error(error.message || 'Something went wrong.');
      setLeavingGroups((prev) => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    },
  });

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    if (!user) return;

    setLeavingGroups((prev) => new Set(prev).add(groupId));
    try {
      const token = await user.getIdToken();
      await leaveGroupMutation.mutateAsync({ groupId, token });
      toast.success(`Left group: ${groupName}`);
    } catch {
      // Error handling is done in onError callback
    }
  };

  return {
    groups,
    groupsLoading,
    meetings: meetingsData,
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

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

  const getWeekBoundaries = (weekOption: WeekOption) => {
    const today = new Date();
    
    if (weekOption === 'this-week') {
      return {
        weekStart: startOfWeek(today, { weekStartsOn: 1 }),
        weekEnd: endOfWeek(today, { weekStartsOn: 1 }),
        today
      };
    } else {
      const nextWeek = addWeeks(today, 1);
      return {
        weekStart: startOfWeek(nextWeek, { weekStartsOn: 1 }),
        weekEnd: endOfWeek(nextWeek, { weekStartsOn: 1 }),
        today
      };
    }
  };

  /*
 * Generates a week view of available meeting slots
 * 
 * Flow:
 * 1. Calculate week boundaries (Mon-Sun) for 'this-week' or 'next-week'
 * 2. For 'this-week': start from today (skip past days), for 'next-week': start from next Monday
 * 3. Process all meeting slots from all groups in meetingsData
 * 4. Filter slots to only include: future slots + within the target week
 * 5. Group filtered slots by date (yyyy-mm-dd)
 * 6. Return array of daily objects: { date: "Mon 15 Jan", count: 3, slots: [...] }
 */

  const processAllSlots = () => {
    const now = new Date();
    const allSlots: Array<{ 
      start: string; 
      end: string; 
      group: string; 
      startDate: Date; 
      endDate: Date;
      dateKey: string;
    }> = [];

    Object.entries(meetingsData).forEach(([groupId, dateMap]) => {
      const groupName = groups.find((g) => g.id === groupId)?.name || 'Unknown Group';
      Object.values(dateMap)
        .flat()
        .forEach((slot) => {
          const startDate = new Date(slot.start);
          const endDate = new Date(slot.end);
          const dateKey = format(startDate, 'yyyy-MM-dd');
          
          allSlots.push({ 
            ...slot, 
            group: groupName,
            startDate,
            endDate,
            dateKey
          });
        });
    });

    return { allSlots, now };
  };

  const { allSlots, now } = processAllSlots();

  const getWeekData = (weekOption: WeekOption) => {
    const { weekStart, weekEnd, today } = getWeekBoundaries(weekOption);

    // For "this week", only include remaining days
    const startDate = weekOption === 'this-week' && today > weekStart ? today : weekStart;

    const daysInRange: Date[] = [];
    const current = new Date(startDate);
    while (current <= weekEnd) {
      daysInRange.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    // Filter and build slot map
    const slotMap: Record<string, { start: string; end: string; group: string }[]> = {};
    
    allSlots.forEach((slot) => {
      // Filter by week range and future slots only
      if (slot.startDate <= now || slot.startDate < weekStart || slot.startDate > weekEnd) return;
      if (!slotMap[slot.dateKey]) slotMap[slot.dateKey] = [];
      slotMap[slot.dateKey].push({ start: slot.start, end: slot.end, group: slot.group });
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

  const getWeekSlots = (weekOption: WeekOption) => {
    const { weekStart, weekEnd} = getWeekBoundaries(weekOption);

    return allSlots
      .filter((slot) => slot.startDate > now && slot.startDate >= weekStart && slot.startDate <= weekEnd)
      .map((slot) => ({ start: slot.start, end: slot.end }));
  };

  const getWeekDaysWithMeetings = (weekOption: WeekOption) => {
    const { weekStart, weekEnd} = getWeekBoundaries(weekOption);

    const uniqueDates = new Set(
      allSlots
        .filter((slot) => slot.startDate > now && slot.startDate >= weekStart && slot.startDate <= weekEnd)
        .map((slot) => slot.dateKey)
    );
    
    return uniqueDates.size;
  };

  const getOngoingMeetings = () => {
    return allSlots
      .filter((slot) => slot.startDate <= now && now <= slot.endDate)
      .map((slot) => ({ start: slot.start, end: slot.end, group: slot.group }));
  };

  const meetingData = getWeekData('this-week');
  const upcomingSlots = getWeekSlots('this-week');
  const upcomingDaysWithMeetings = getWeekDaysWithMeetings('this-week');
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

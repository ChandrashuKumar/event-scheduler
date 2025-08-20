'use client';

import { StatsCard } from './StatsCard';

interface StatsOverviewProps {
  totalGroups: number;
  upcomingDaysWithMeetings: number;
  upcomingSlots: number;
}

const StatsOverview = ({ 
  totalGroups, 
  upcomingDaysWithMeetings, 
  upcomingSlots 
}: StatsOverviewProps) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <StatsCard
        icon={
          <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        iconBgColor="bg-pink-500/10"
        badge="Active"
        value={totalGroups}
        label="Total Groups"
      />

      <StatsCard
        icon={
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        iconBgColor="bg-emerald-500/10"
        badge="This Week"
        value={upcomingDaysWithMeetings}
        label="Days with Meetings"
      />

      <StatsCard
        icon={
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        iconBgColor="bg-purple-500/10"
        badge="Upcoming"
        value={upcomingSlots}
        label="Meeting Slots"
        className="sm:col-span-2 lg:col-span-1"
      />
    </section>
  );
};

export default StatsOverview;
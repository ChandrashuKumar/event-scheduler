'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useDashboardData } from '@/hooks/useDashboardData';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatsOverview from '@/components/dashboard/StatsOverview';
import OngoingMeetings from '@/components/dashboard/OngoingMeetings';
import WeeklyChart from '@/components/dashboard/WeeklyChart';
import GroupsSection from '@/components/dashboard/GroupsSection';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  
  // Use custom hook for all dashboard data
  const {
    groups,
    groupsLoading,
    meetingData,
    ongoingMeetings,
    leavingGroups,
    handleLeaveGroup,
    meetingLoading
  } = useDashboardData();

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />

      <DashboardHeader />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        <StatsOverview
          totalGroups={groups.length}
        />

        <OngoingMeetings meetings={ongoingMeetings} isLoading={meetingLoading} />

        <WeeklyChart
          data={meetingData}
          isLoading={meetingLoading}
        />

        <GroupsSection
          groups={groups}
          groupsLoading={groupsLoading}
          leavingGroups={leavingGroups}
          onLeaveGroup={handleLeaveGroup}
        />
      </main>
    </div>
  );
}

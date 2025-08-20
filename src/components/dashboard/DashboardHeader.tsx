'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

const DashboardHeader = () => {
  const { user } = useAuth();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <header className="border-b border-border bg-pink-100/40 dark:bg-card">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
              {greeting}, {user?.displayName?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
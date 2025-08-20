'use client';

import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  iconBgColor: string;
  badge: string;
  value: number;
  label: string;
  className?: string;
}

const StatsCard = ({ 
  icon, 
  iconBgColor, 
  badge, 
  value, 
  label, 
  className = "" 
}: StatsCardProps) => {
  return (
    <div className={`bg-pink-100/40 dark:bg-card border border-border rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-purple-700 dark:bg-muted dark:text-foreground dark:px-2 dark:py-1 dark:rounded-full">
          {badge}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-xl sm:text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
};

export { StatsCard };
export default StatsCard;
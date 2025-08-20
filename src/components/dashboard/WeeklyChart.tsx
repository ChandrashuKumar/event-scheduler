'use client';

import { WeeklyBarChart } from './chart/WeeklyBarChart';
import type { ChartDataPoint } from './chart/chartConstants';

interface WeeklyChartProps {
  data: ChartDataPoint[];
  isLoading: boolean;
}

const WeeklyChart = ({ data, isLoading }: WeeklyChartProps) => {
  return (
    <section className="bg-blue-50 dark:bg-card border border-border rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Weekly Schedule</h2>
          <p className="text-sm text-muted-foreground">Upcoming meeting slots overview</p>
        </div>
        <div className="px-3 py-1 bg-blue-100 dark:bg-muted text-blue-700 dark:text-muted-foreground rounded-full text-sm font-medium">
          This Week
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-64 bg-blue-100/50 dark:bg-muted/20 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-muted-foreground text-sm">Loading chart...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center bg-blue-100/50 dark:bg-muted/20 rounded-lg">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-muted-foreground text-sm">No meetings scheduled this week</p>
          </div>
        </div>
      ) : (
        <WeeklyBarChart data={data} />
      )}
    </section>
  );
};

export default WeeklyChart;
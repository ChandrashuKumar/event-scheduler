'use client';

import { format } from 'date-fns';
import { MEETING_COLORS } from './chartConstants';
import type { ChartSlot } from './chartConstants';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      slots: ChartSlot[];
      count: number;
    };
  }>;
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const { slots, count } = payload[0].payload;

    return (
      <div className="bg-pink-50/95 dark:bg-popover/95 backdrop-blur-sm border border-border/50 p-4 rounded-2xl text-sm shadow-2xl max-w-xs transition-all duration-200">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/30">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <p className="font-semibold text-foreground text-base">{label}</p>
          <span className="ml-auto px-2 py-0.5 text-sm rounded-full bg-primary/10 text-primary font-medium">
            {count} {count === 1 ? 'meeting' : 'meetings'}
          </span>
        </div>
        
        {slots && slots.length > 0 ? (
          <div className="space-y-2.5 max-h-40 overflow-y-auto custom-scrollbar">
            {slots.map((s: ChartSlot, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-pink-100/40 dark:bg-muted/30 hover:bg-pink-200/40 dark:hover:bg-muted/50 transition-colors">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MEETING_COLORS[idx % MEETING_COLORS.length] }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-foreground text-sm font-medium">
                    {format(new Date(s.start), 'HH:mm')} – {format(new Date(s.end), 'HH:mm')}
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-0.5">
                    {s.group}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-4">
            <div className="text-center">
              <div className="w-8 h-8 bg-pink-100/50 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-muted-foreground text-lg">📅</span>
              </div>
              <p className="text-muted-foreground text-sm">No meetings scheduled</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};
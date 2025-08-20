'use client';

import { format } from 'date-fns';

type OngoingMeeting = {
  start: string;
  end: string;
  group: string;
};

interface OngoingMeetingsProps {
  meetings: OngoingMeeting[];
}

const OngoingMeetings = ({ meetings }: OngoingMeetingsProps) => {
  if (meetings.length === 0) {
    return null;
  }

  return (
    <section className="bg-pink-300/30 dark:bg-card border-emerald-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-foreground">Live Meetings</h2>
          </div>
          <span className="px-2 py-1 text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
            {meetings.length} active
          </span>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {meetings.map((meeting, idx) => (
          <div
            key={`ongoing-${idx}`}
            className="bg-blue-50 dark:bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-foreground text-sm truncate">{meeting.group}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-base">
                <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </div>
                <span className="text-muted-foreground">Started</span>
                <span className="font-mono text-foreground">
                  {format(new Date(meeting.start), 'h:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-2 text-base">
                <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-muted-foreground">Ends</span>
                <span className="font-mono text-foreground">
                  {format(new Date(meeting.end), 'h:mm a')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OngoingMeetings;
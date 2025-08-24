'use client';

import { format } from 'date-fns';

type OngoingMeeting = {
  start: string;
  end: string;
  group: string;
};

interface OngoingMeetingsProps {
  meetings: OngoingMeeting[];
  isLoading?: boolean;
}

const OngoingMeetings = ({ meetings, isLoading = false }: OngoingMeetingsProps) => {
  const renderHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${meetings.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30'} rounded-full`}></div>
          <h2 className="text-lg font-semibold text-foreground">Live Meetings</h2>
        </div>
        <span className={`px-2 py-1 text-sm font-medium rounded-full ${
          meetings.length > 0 
            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-muted text-muted-foreground'
        }`}>
          {isLoading ? '...' : `${meetings.length} active`}
        </span>
      </div>
    </div>
  );

  const renderLoadingState = () => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 2 }).map((_, idx) => (
        <div
          key={`loading-${idx}`}
          className="bg-blue-50/50 dark:bg-card/50 border border-border rounded-xl p-4 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-muted-foreground/30 rounded-full"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-20"></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted-foreground/20 rounded"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-16"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-12"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted-foreground/20 rounded"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-16"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-muted/20 dark:bg-muted/10 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No Live Meetings</h3>
      <p className="text-muted-foreground max-w-md">
        There are currently no ongoing meetings. Live meetings will appear here when they start.
      </p>
    </div>
  );

  const renderMeetings = () => (
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
  );

  return (
    <section className="bg-pink-300/30 dark:bg-card border-emerald-500/20 rounded-xl p-6">
      {renderHeader()}
      
      {isLoading ? renderLoadingState() : (
        meetings.length > 0 ? renderMeetings() : renderEmptyState()
      )}
    </section>
  );
};

export default OngoingMeetings;
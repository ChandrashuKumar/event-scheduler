import { useState } from 'react';
import { Availability } from '@/generated/prisma';
import Skeleton from 'react-loading-skeleton';
import { format } from 'date-fns';
import { ButtonLoader } from '@/components/ui/loader';

interface Props {
  entries: Availability[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export default function AvailabilityList({ entries, loading, onDelete }: Props) {
  const [deletingAvailability, setDeletingAvailability] = useState<Set<string>>(new Set());

  const handleDelete = async (availabilityId: string) => {
    setDeletingAvailability(prev => new Set(prev).add(availabilityId));
    try {
      await onDelete(availabilityId);
    } catch {
      // Error handling is done in parent
    } finally {
      setDeletingAvailability(prev => {
        const newSet = new Set(prev);
        newSet.delete(availabilityId);
        return newSet;
      });
    }
  };
  const groupedByDate = entries.reduce(
    (acc, entry) => {
      const date = format(new Date(entry.startDateTime), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    },
    {} as Record<string, Availability[]>
  );

  const sorted = Object.entries(groupedByDate).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-pink-100/40 dark:bg-card p-6 rounded-xl shadow-lg border border-border">
        <h2 className="text-lg font-semibold mb-3 text-foreground">Your Submitted Availability</h2>

        {loading ? (
          <Skeleton
            count={4}
            height={20}
            baseColor="#e2e8f0"
            highlightColor="#f1f5f9"
            className="mb-1 dark:[&>span]:!bg-[#313131] dark:[&>span]:after:!bg-[#525252]"
          />
        ) : sorted.length > 0 ? (
          <div className="space-y-6">
            {sorted.map(([date, slots]) => (
              <div key={date}>
                <h3 className="text-md font-semibold text-pink-600 dark:text-pink-400 mb-2">
                  {format(new Date(date), 'EEEE, MMMM do yyyy')}
                </h3>
                <ul className="space-y-2">
                  {slots.map((slot) => (
                    <li
                      key={slot.id}
                      className="flex justify-between items-center bg-blue-100/50 dark:bg-muted/50 px-4 py-2 rounded-lg"
                    >
                      <span className="text-sm text-foreground">
                        {format(new Date(slot.startDateTime), 'hh:mm a')} –{' '}
                        {format(new Date(slot.endDateTime), 'hh:mm a')}
                      </span>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        disabled={deletingAvailability.has(slot.id)}
                        className="text-sm cursor-pointer bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {deletingAvailability.has(slot.id) && <ButtonLoader />}
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No availability submitted yet.</p>
        )}
      </div>
    </div>
  );
}

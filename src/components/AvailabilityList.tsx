import { Availability } from '@/generated/prisma';
import Skeleton from 'react-loading-skeleton';
import { format } from 'date-fns';
import { ButtonLoader } from '@/components/ui/loader';

interface Props {
  entries: Availability[];
  loading: boolean;
  handleDelete: (id: string) => void;
  deletingAvailability?: Set<string>;
}

export default function AvailabilityList({ entries, loading, handleDelete, deletingAvailability = new Set() }: Props) {
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
      <div className="bg-zinc-800 p-6 rounded-lg shadow border border-zinc-700">
        <h2 className="text-lg font-semibold mb-3 text-white">Your Submitted Availability</h2>

        {loading ? (
          <Skeleton
            count={4}
            height={20}
            baseColor="#313131"
            highlightColor="#525252"
            className="mb-1"
          />
        ) : sorted.length > 0 ? (
          <div className="space-y-6">
            {sorted.map(([date, slots]) => (
              <div key={date}>
                <h3 className="text-md font-semibold text-indigo-300 mb-2">
                  {format(new Date(date), 'EEEE, MMMM do yyyy')}
                </h3>
                <ul className="space-y-2">
                  {slots.map((slot) => (
                    <li
                      key={slot.id}
                      className="flex justify-between items-center bg-zinc-700/40 px-4 py-2 rounded-md"
                    >
                      <span className="text-sm text-white">
                        {format(new Date(slot.startDateTime), 'hh:mm a')} –{' '}
                        {format(new Date(slot.endDateTime), 'hh:mm a')}
                      </span>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        disabled={deletingAvailability.has(slot.id)}
                        className="text-sm cursor-pointer bg-[#ff1450] hover:bg-[#e20b42] text-white px-4 py-2 rounded font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
          <p className="text-sm text-gray-400">No availability submitted yet.</p>
        )}
      </div>
    </div>
  );
}

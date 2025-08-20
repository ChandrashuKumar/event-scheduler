import { Loader } from '@/components/ui/loader';

export default function ResolvedSlots({
  showResults,
  loadingResolved,
  resolved,
}: {
  showResults: boolean;
  loadingResolved: boolean;
  resolved: Record<string, { start: string; end: string }[]>;
}) {
  if (!showResults) return null;

  return (
    <div className="mt-12 bg-blue-50 dark:bg-card p-6 rounded-2xl shadow-xl border border-border max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-pink-500 text-white px-3 py-1 text-xs rounded-full font-semibold">
          CONFLICT-FREE
        </span>
        <h2 className="text-xl font-bold text-foreground">🧠 Group Availability Result</h2>
      </div>

      {loadingResolved ? (
        <div className="flex items-center justify-center py-8">
          <Loader size="lg" variant="spinner" text="⏳ Calculating conflicts..." />
        </div>
      ) : Object.keys(resolved).length === 0 ? (
        <p className="text-sm text-muted-foreground">No overlapping availability found.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(resolved).map(([day, intervals]) => (
            <div key={day}>
              <h3 className="text-lg text-pink-600 dark:text-pink-400 font-semibold border-b border-border pb-1 mb-4">
                {day}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {intervals.map((interval, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-100/50 dark:bg-muted/50 hover:bg-blue-100/70 dark:hover:bg-muted/70 transition-all rounded-lg px-4 py-3 shadow border border-border text-foreground space-y-1"
                  >
                    <div className="grid grid-cols-[80px_1fr] items-center">
                      <span className="text-green-600 dark:text-green-400 font-semibold flex items-center">
                        🟢 Start:
                      </span>
                      <span className="text-lg font-mono text-foreground">
                        {new Date(interval.start).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>

                    <div className="grid grid-cols-[80px_1fr] items-center">
                      <span className="text-red-600 dark:text-red-400 font-semibold flex items-center">🔴 End:</span>
                      <span className="text-lg font-mono text-foreground">
                        {new Date(interval.end).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

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
    <div className="mt-12 bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="bg-purple-700 text-white px-3 py-1 text-xs rounded-full font-semibold">
          CONFLICT-FREE
        </span>
        <h2 className="text-xl font-bold text-white">🧠 Group Availability Result</h2>
      </div>

      {loadingResolved ? (
        <p className="text-sm text-gray-400">⏳ Calculating...</p>
      ) : Object.keys(resolved).length === 0 ? (
        <p className="text-sm text-gray-400">No overlapping availability found.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(resolved).map(([day, intervals]) => (
            <div key={day}>
              <h3 className="text-lg text-indigo-300 font-semibold border-b border-zinc-600 pb-1 mb-4">
                {day}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {intervals.map((interval, idx) => (
                  <div
  key={idx}
  className="bg-zinc-700/60 hover:bg-zinc-700 transition-all rounded-lg px-4 py-3 shadow border border-zinc-600 text-white space-y-1"
>
  <div className="grid grid-cols-[80px_1fr] items-center">
    <span className="text-emerald-400 font-semibold flex items-center">🟢 Start:</span>
    <span className="text-lg font-mono text-white">
      {new Date(interval.start).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}
    </span>
  </div>

  <div className="grid grid-cols-[80px_1fr] items-center">
    <span className="text-rose-400 font-semibold flex items-center">🔴 End:</span>
    <span className="text-lg font-mono text-white">
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

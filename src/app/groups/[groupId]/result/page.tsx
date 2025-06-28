'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AvailabilityResult() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState<Record<string, { start: string; end: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResolved = async () => {
      if (!user || !groupId) return;

      try {
        const res = await fetch(`/api/availability/resolve?groupId=${groupId}`);
        const data = await res.json();

        if (res.ok) {
          setResult(data);
        } else {
          setError(data.error || 'Something went wrong');
        }
      } catch (err) {
        console.error(err);
        setError('Server error');
      } finally {
        setLoading(false);
      }
    };

    fetchResolved();
  }, [user, groupId]);

  if (loading) return <p className="p-8">⏳ Calculating availability...</p>;
  if (error) return <p className="text-red-600 p-8">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">🧠 Group Conflict-Free Slots</h1>

      {Object.keys(result).length === 0 ? (
        <p>No overlapping availability found.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(result).map(([day, intervals]) => (
            <div key={day}>
              <h2 className="font-semibold text-lg">{day}</h2>
              <ul className="list-disc list-inside ml-4">
                {intervals.map((interval, idx) => (
                  <li key={idx}>
                    {interval.start} - {interval.end}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

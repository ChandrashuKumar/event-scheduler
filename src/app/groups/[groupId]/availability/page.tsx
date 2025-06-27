'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AvailabilityForm() {
  const { groupId } = useParams();
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('');
  const [entries, setEntries] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return;

      const token = await user.getIdToken();
      const res = await fetch(`/api/availability/list?groupId=${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setEntries(data);
    };

    fetchAvailability();
  }, [user, groupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await user?.getIdToken();

    const res = await fetch('/api/availability/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        groupId,
        day,
        startTime,
        endTime,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      setStatus('✅ Availability submitted!');
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Submit Availability</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Day</label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          >
            <option value="">--Select a day--</option>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
              (d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="block font-medium">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>

        <div>
          <label className="block font-medium">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border px-3 py-2 rounded w-full"
            required
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit
        </button>

        {status && <p className="mt-2">{status}</p>}
      </form>

      {entries.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Your Submitted Availability</h2>
          <ul className="list-disc list-inside">
            {entries.map((a) => (
              <li key={a.id}>
                {a.day}: {a.startTime} - {a.endTime}
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        onClick={() => router.push(`/groups/${groupId}/result`)}
        className="bg-purple-600 text-white px-4 py-2 rounded"
      >
        🧠 View Common Time Slots
      </button>
    </div>
  );
}

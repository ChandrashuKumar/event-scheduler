'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { type Availability } from '@/generated/prisma';

type GroupMemberBasic = {
  id: string;
  name: string;
};

export default function AvailabilityForm() {
  const { groupId } = useParams();
  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState('');
  const [entries, setEntries] = useState<Availability[]>([]);
  const [members, setMembers] = useState<GroupMemberBasic[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return;
      setLoadingEntries(true);
      const token = await user.getIdToken();
      const res = await fetch(`/api/availability/list?groupId=${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setEntries(data);
      setLoadingEntries(false);
    };

    const fetchMembers = async () => {
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`/api/group/members?groupId=${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setMembers(data);
    };

    fetchAvailability();
    fetchMembers();
  }, [user, groupId, status]);

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
      setDay('');
      setStartTime('');
      setEndTime('');
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
  };

  const handleDelete = async (availabilityId: string) => {
    const token = await user?.getIdToken();
    const res = await fetch(`/api/availability/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ availabilityId }),
    });

    if (res.ok) {
      toast.success('Availability deleted!');
      setEntries((prev) => prev.filter((entry) => entry.id !== availabilityId));
    } else {
      toast.error('Error deleting availability');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h1 className="text-2xl font-bold mb-6 text-center">Submit Availability</h1>

      {/* Form and Members Side-by-Side */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-6 bg-zinc-800 p-6 rounded-xl shadow-lg"
        >
          <div>
            <label className="block font-medium mb-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded w-full text-white"
              required
            >
              <option value="">-- Select a day --</option>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded w-full text-white"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block font-medium mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 px-3 py-2 rounded w-full text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 transition-colors text-white px-4 py-2 rounded w-full font-semibold"
          >
            Submit
          </button>

          {status && <p className="text-sm mt-2 text-center">{status}</p>}
        </form>

        {/* Right: Members */}
        <div className="flex-1 bg-zinc-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-lg font-semibold mb-3 text-center">Group Members</h2>
          {members.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {members.map((m) => (
                <li key={m.id}>{m.name}</li>
              ))}
            </ul>
          ) : (
            <Skeleton
              count={4}
              height={20}
              baseColor="#313131"
              highlightColor="#525252"
              className="mb-1"
            />
          )}
        </div>
      </div>

      {/* Submitted Availability (below form only, not full width) */}
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-zinc-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">Your Submitted Availability</h2>
          {loadingEntries ? (
            <Skeleton
              count={4}
              height={20}
              baseColor="#313131"
              highlightColor="#525252"
              className="mb-1"
            />
          ) : entries.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {entries.map((a) => (
                <li key={a.id} className="flex justify-between items-center px-4 py-2 rounded">
                  <span>
                    {a.day}: {a.startTime} - {a.endTime}
                  </span>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-white bg-red-800 hover:bg-red-900 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-red-800 dark:hover:bg-red-900"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No availability submitted yet.</p>
          )}
        </div>
      </div>

      {/* View Slots Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push(`/groups/${groupId}/result`)}
          className="bg-purple-700 hover:bg-purple-800 transition-colors text-white px-5 py-2 rounded"
        >
          🧠 View Common Time Slots
        </button>
      </div>
    </div>
  );
}

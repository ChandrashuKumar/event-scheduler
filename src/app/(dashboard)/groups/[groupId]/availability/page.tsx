'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { type Availability } from '@/generated/prisma';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
          className="flex-1 space-y-6 bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700"
        >
          <div>
            <label className="block font-medium text-white mb-1">Day</label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger className="w-full bg-zinc-900 border border-zinc-700 text-white">
                <SelectValue placeholder="-- Select a day --" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 text-white border border-zinc-700">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(
                  (d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium text-white mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded w-full text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block font-medium text-white mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded w-full text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-4 py-2 rounded w-full font-semibold"
          >
            ✅ Submit Availability
          </button>

          {status && (
            <div className="text-sm mt-2 text-center bg-zinc-700 text-white py-2 px-3 rounded">
              {status}
            </div>
          )}
        </form>

        {/* Right: Members */}
        <div className="flex-1 bg-zinc-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-1">Team Members</h2>
          <p className="text-sm text-gray-400 mb-4">Invite your team members to collaborate.</p>

          {members.length > 0 ? (
            <ul className="space-y-4">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between bg-zinc-700/40 px-4 py-3 rounded-md hover:bg-zinc-700/60 transition"
                >
                  {/* Avatar and Info */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                      {m.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{m.name}</p>
                      <p className="text-sm text-gray-400">member@team.app</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton
              count={3}
              height={50}
              baseColor="#313131"
              highlightColor="#525252"
              className="rounded-md"
            />
          )}
        </div>
      </div>

      {/* Submitted Availability (below form only, not full width) */}
      <div className="max-w-xl mx-auto mt-10">
        <div className="bg-zinc-800 p-6 rounded-lg shadow border border-zinc-700">
          <h2 className="text-lg font-semibold mb-3 text-white">Your Submitted Availability</h2>

          {loadingEntries ? (
            <Skeleton
              count={4}
              height={20}
              baseColor="#313131"
              highlightColor="#525252"
              className="mb-1"
            />
          ) : entries.length > 0 ? (
            <ul className="space-y-3">
              {entries.map((a) => (
                <li
                  key={a.id}
                  className="flex justify-between items-center bg-zinc-700/40 px-4 py-2 rounded-md"
                >
                  <div className="text-white">
                    <p className="font-medium">{a.day}</p>
                    <p className="text-sm text-gray-300">
                      {a.startTime} – {a.endTime}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-sm bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-medium transition"
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

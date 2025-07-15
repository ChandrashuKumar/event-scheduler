'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { type Availability } from '@/generated/prisma';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/analog_time_picker';
import 'react-multi-date-picker/styles/backgrounds/bg-dark.css';
import { format } from 'date-fns';

type GroupMemberBasic = {
  id: string;
  name: string;
  email: string;
};

export default function AvailabilityForm() {
  const { groupId } = useParams();
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [status, setStatus] = useState('');
  const [entries, setEntries] = useState<Availability[]>([]);
  const [members, setMembers] = useState<GroupMemberBasic[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const { user } = useAuth();
  const router = useRouter();
  console.log(members);
  

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
        startDateTime,
        endDateTime,
      }),
    });

    const result = await res.json();
    if (res.ok) {
      setStatus('✅ Availability submitted!');
      setStartDateTime('');
      setEndDateTime('');
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

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Availability[]>();

    entries.forEach((entry) => {
      const date = format(new Date(entry.startDateTime), 'yyyy-MM-dd');
      if (!map.has(date)) map.set(date, []);
      map.get(date)?.push(entry);
    });

    return Array.from(map.entries()).sort(([a], [b]) => (a > b ? 1 : -1));
  }, [entries]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h1 className="text-2xl font-bold mb-6 text-center">Submit Availability</h1>

      {/* Form and Members Side-by-Side */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-10 bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block font-semibold text-white mb-4">Start Date & Time</label>
              <DatePicker
                value={startDateTime}
                onChange={(val) => setStartDateTime(val?.toDate()?.toISOString() || '')}
                format="YYYY/MM/DD HH:mm"
                plugins={[<TimePicker key="start-time" hideSeconds />]}
                containerClassName="w-full"
                className="bg-dark"
                inputClass="w-full px-4 py-2 bg-zinc-900 text-white placeholder-gray-400 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                placeholder="Select"
              />
            </div>

            <div className="flex-1">
              <label className="block font-semibold text-white mb-4">End Date & Time</label>
              <DatePicker
                value={endDateTime}
                onChange={(val) => setEndDateTime(val?.toDate()?.toISOString() || '')}
                format="YYYY/MM/DD HH:mm"
                plugins={[<TimePicker key="end-time" hideSeconds />]}
                className="bg-dark"
                containerClassName="w-full"
                inputClass="w-full px-4 py-2 bg-zinc-900 text-white placeholder-gray-400 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
                placeholder="Select"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-6 py-2 rounded font-semibold cursor-pointer"
            >
              ✅ Submit Availability
            </button>
          </div>

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
                      <p className="text-sm text-gray-400">{m.email}</p>
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
          ) : groupedByDate.length > 0 ? (
            <div className="space-y-6">
              {groupedByDate.map(([date, slots]: [string, Availability[]]) => (
                <div key={date}>
                  <h3 className="text-md font-semibold text-indigo-300 mb-2">
                    {format(new Date(date), 'EEEE, MMMM do yyyy')}
                  </h3>
                  <ul className="space-y-2">
                    {slots.map((slot: Availability) => (
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
                          className="text-sm cursor-pointer bg-[#ff1450] hover:bg-[#e20b42] text-white px-4 py-2 rounded font-medium transition"
                        >
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

      {/* View Slots Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => router.push(`/groups/${groupId}/result`)}
          className="bg-purple-700 hover:bg-purple-800 transition-colors cursor-pointer text-white px-5 py-2 rounded"
        >
          🧠 View Common Time Slots
        </button>
      </div>
    </div>
  );
}

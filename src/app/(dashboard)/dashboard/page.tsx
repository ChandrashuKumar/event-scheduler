'use client';
import useSWR from 'swr';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { BarChart, XAxis, YAxis, Tooltip, Bar, Cell, ResponsiveContainer } from 'recharts';
import { Group } from '@/generated/prisma/client';

const MEETING_COLORS = ['#22c55e', '#3b82f6', '#eab308', '#ec4899', '#a78bfa'];
type Slot = {
  start: string;
  end: string;
};

type MeetingsMap = Record<string, Slot[]>;

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const fetcherWithToken = async (url: string, token: string | undefined) => {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  const { data: groupList = [], isLoading: groupsLoading } = useSWR(
    user ? ['/api/group/list', user] : null,
    async ([url, user]) => {
      const token = await user.getIdToken();
      return fetcherWithToken(url, token);
    }
  );

  const groups: Group[] = groupList;

  const { data: meetings = {}, isLoading: meetingLoading } = useSWR<Record<string, MeetingsMap>>(
    groups.length ? ['/api/availability/resolve', groups] : null,
    async () => {
      const token = await user?.getIdToken();
      const res = await fetch('/api/availability/resolve', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupIds: groups.map((g) => g.id) }),
      });
      if (!res.ok) throw new Error('Failed to fetch multi-group meetings');
      return res.json();
    }
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const meetingData = useMemo(() => {
    const now = new Date();
    const today = new Date();
    const dayOfWeek = today.getDay();

    const remainingDays = Array.from({ length: 7 - dayOfWeek }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date;
    });

    // Build merged map from all groups
    const slotMap: Record<string, { start: string; end: string; group: string }[]> = {};

    Object.entries(meetings).forEach(([groupId, dateMap]) => {
      const groupName = groups.find((g) => g.id === groupId)?.name || 'Unknown Group';
      Object.values(dateMap)
        .flat()
        .forEach((slot) => {
          if (new Date(slot.start) <= now) return;
          const dateKey = format(new Date(slot.start), 'yyyy-MM-dd');
          if (!slotMap[dateKey]) slotMap[dateKey] = [];
          slotMap[dateKey].push({ ...slot, group: groupName });
        });
    });

    return remainingDays.map((date) => {
      const key = format(date, 'yyyy-MM-dd');
      const slots = slotMap[key] || [];
      return {
        date: format(date, 'EEE dd MMM'),
        count: slots.length,
        slots,
      };
    });
  }, [meetings, groups]);

  const upcomingSlots = useMemo(() => {
    const now = new Date();

    return Object.values(meetings).flatMap((groupSlots) =>
      Object.values(groupSlots)
        .flat()
        .filter((slot) => new Date(slot.start) > now)
    );
  }, [meetings]);

  const upcomingDaysWithMeetings = useMemo(() => {
    const uniqueDates = new Set(
      upcomingSlots.map((slot) => format(new Date(slot.start), 'yyyy-MM-dd'))
    );
    return uniqueDates.size;
  }, [upcomingSlots]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const { slots } = payload[0].payload;

    return (
      <div className="bg-gradient-to-br from-[#1f1f2e] to-[#2c2c3e] border border-fuchsia-700 p-4 rounded-lg text-sm text-white shadow-2xl max-w-sm">
        <p className="font-semibold text-fuchsia-400 mb-3 text-base">
          📅 {label}
        </p>
        {slots && slots.length > 0 ? (
          <ul className="space-y-2">
            {slots.map(
              (s: { start: string; end: string; group: string }, idx: number) => (
                <li key={idx} className="flex items-center justify-between text-white">
                  <span className="font-mono text-sky-300">
                    {format(new Date(s.start), 'HH:mm')}–{format(new Date(s.end), 'HH:mm')}
                  </span>
                  <span className="ml-4 px-2 py-0.5 text-xs rounded bg-fuchsia-700/30 text-fuchsia-300 font-medium">
                    {s.group}
                  </span>
                </li>
              )
            )}
          </ul>
        ) : (
          <p className="text-gray-400 italic">No meetings</p>
        )}
      </div>
    );
  }

  return null;
};



  if (loading) return <p className="p-8 text-white">Loading...</p>;
  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 space-y-8 text-white bg-gray-900 min-h-screen overflow-x-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Greeting */}
      <header className="space-y-1">
        <h1 className="text-3xl sm:text-4xl font-bold">
          {greeting}, {user.displayName || user.email}!
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          {format(new Date(), 'EEEE do MMM yyyy')}
        </p>
      </header>

      <div className="border-t border-zinc-700 my-8" />

      <div className="flex flex-wrap justify-between gap-4 text-xs sm:text-base">
        <div className="flex-1 min-w-[100px] bg-gray-800 p-4 rounded shadow text-center">
          <p className="text-gray-400 h-10">Total Groups</p>
          <p className="text-2xl font-bold text-indigo-300">{groups.length}</p>
        </div>
        <div className="flex-1 min-w-[100px] bg-gray-800 p-4 rounded shadow text-center">
          <p className="text-gray-400 h-10">Days with Meetings</p>
          <p className="text-2xl font-bold text-lime-300">{upcomingDaysWithMeetings}</p>
        </div>
        <div className="flex-1 min-w-[100px] bg-gray-800 p-4 rounded shadow text-center">
          <p className="text-gray-400 h-10">Total Meeting Slots</p>
          <p className="text-2xl font-bold text-pink-300">{upcomingSlots.length}</p>
        </div>
      </div>

      <div className="border-t border-zinc-700 my-8" />

      {/* Meeting Schedule */}
      <section className="bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Upcoming Meeting Slots This Week</h2>
        {meetingLoading ? (
          <Skeleton
            height={300}
            width="100%"
            baseColor="#1e2939"
            highlightColor="#374151"
            borderRadius="0.5rem"
          />
        ) : meetingData.length === 0 ? (
          <p className="text-gray-400">No common time slots found for this week.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={meetingData}>
              <XAxis dataKey="date" stroke="#ffffff" />
              <YAxis allowDecimals={false} stroke="#ffffff" />
              <Tooltip content={<CustomTooltip />} />


              <Bar dataKey="count">
                {meetingData.map((entry, index) => (
                  <Cell
                    key={`bar-${entry.date}`}
                    fill={MEETING_COLORS[index % MEETING_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <div className="border-t border-zinc-700 my-8" />

      {/* Group List */}
      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Your Groups</h2>
        {groupsLoading ? (
          <Skeleton count={3} height={60} baseColor="#1e2939" highlightColor="#374151" />
        ) : groups.length === 0 ? (
          <p className="text-gray-400">You’re not in any groups yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {groups.map((group) => (
              <div
                key={group.id}
                className="relative group bg-gradient-to-br from-[#2a1a3f] to-[#1a1029] border border-[#3a2e4c] rounded-xl p-5 shadow-lg transition duration-300 hover:shadow-2xl"
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-fuchsia-600 text-white text-sm font-semibold rounded-full w-9 h-9 flex items-center justify-center shadow">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-lg font-semibold text-white truncate max-w-[200px]">
                      {group.name}
                    </h3>
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(group.id);
                      toast.success('Group ID copied!');
                    }}
                    className="text-sm font-medium text-slate-200 hover:text-white px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-md transition cursor-pointer"
                    title="Copy Group ID"
                  >
                    📋 Copy ID
                  </button>
                </div>

                {/* Description */}
                <p className="text-zinc-400 text-sm mb-4">
                  Collaborate and resolve availability with your team.
                </p>

                {/* CTA */}
                <div className="flex justify-end">
                  <button
                    onClick={() => router.push(`/groups/${group.id}/availability`)}
                    className="text-sm font-medium px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-md transition cursor-pointer"
                  >
                    Open Group →
                  </button>
                </div>

                {/* Subtle hover ring */}
                <div className="absolute inset-0 rounded-xl ring-1 ring-fuchsia-500/10 group-hover:ring-fuchsia-500/40 transition pointer-events-none" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

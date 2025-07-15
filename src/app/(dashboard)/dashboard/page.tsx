'use client';

import { useEffect, useMemo, useState } from 'react';
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

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [meetings, setMeetings] = useState<Record<string, { start: string; end: string }[]>>({});
  const [meetingLoading, setMeetingLoading] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }

    const fetchGroups = async () => {
      if (!user) return;
      setGroupsLoading(true);
      const token = await user.getIdToken();
      const res = await fetch('/api/group/list', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data);

      setGroups(Array.isArray(data) ? data : []);
      setGroupsLoading(false);
    };

    const fetchMeetings = async () => {
      if (!user) return;
      setMeetingLoading(true);
      try {
        const token = await user.getIdToken();
        const groupList = await fetch('/api/group/list', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const groupData = await groupList.json();
        const group = Array.isArray(groupData) ? groupData[0] : null;
        if (!group) return;

        const res = await fetch(`/api/availability/resolve?groupId=${group.id}`);
        const data = await res.json();
        setMeetings(data || {});
      } catch (e) {
        console.error(e);
        toast.error('Failed to fetch meetings');
      } finally {
        setMeetingLoading(false);
      }
    };

    fetchGroups();
    fetchMeetings();
  }, [user, loading, router]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const meetingData = useMemo(() => {
    const weekdayLabels = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const todayIndex = new Date().getDay(); // 0 (Sun) to 6 (Sat)
    const upcomingWeekdays = weekdayLabels.slice(todayIndex);

    return upcomingWeekdays.map((day) => ({
      day,
      count: meetings[day]?.length || 0,
    }));
  }, [meetings]);

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
          <p className="text-2xl font-bold text-lime-300">{Object.keys(meetings).length}</p>
        </div>
        <div className="flex-1 min-w-[100px] bg-gray-800 p-4 rounded shadow text-center">
          <p className="text-gray-400 h-10">Total Meeting Slots</p>
          <p className="text-2xl font-bold text-pink-300">
            {Object.values(meetings).reduce((acc, cur) => acc + cur.length, 0)}
          </p>
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
              <XAxis dataKey="day" stroke="#ffffff" />
              <YAxis allowDecimals={false} stroke="#ffffff" />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: number, name: string, props: any) => {
                  const day = props.payload.day;
                  const slots = meetings[day] || [];
                  return [
                    `${slots.map((s) => `${s.start}–${s.end}`).join(', ') || 'No meetings'}`,
                    'Slots',
                  ];
                }}
                contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#fff' }}
              />

              <Bar dataKey="count">
                {meetingData.map((entry, index) => (
                  <Cell
                    key={`bar-${entry.day}`}
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

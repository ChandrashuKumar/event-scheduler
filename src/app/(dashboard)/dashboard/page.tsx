'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { type Group } from '@/generated/prisma/client';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }

    const fetchGroups = async () => {
      if (!user) return;
      setGroupsLoading(true);
      const token = await user?.getIdToken();
      const res = await fetch('/api/group/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      //console.log('Group data:', data);
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        //console.error('Unexpected group response format:', data);
        setGroups([]); // set to empty to prevent crash
      }
      setGroupsLoading(false);
    };

    fetchGroups();
  }, [user, loading, router]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (!user) return null; // prevent flash of protected content

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Welcome, {user?.displayName || user?.email}</p>
      </header>

      <section className="flex flex-wrap gap-4">
        <button
          onClick={() => router.push('/create-group')}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-md shadow transition"
        >
          ➕ Create Group
        </button>

        <button
          onClick={() => router.push('/join-group')}
          className="flex items-center gap-2 bg-lime-600 hover:bg-lime-500 text-white px-5 py-2 rounded-md shadow transition"
        >
          🔗 Join Group
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-md shadow transition"
        >
          🚪 Logout
        </button>
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-white mb-4">Your Groups</h2>
        {groupsLoading ? (
          <Skeleton count={3} height={60} baseColor="#1f1f1f" highlightColor="#2e2e2e" />
        ) : groups.length === 0 ? (
          <p className="text-gray-400">You’re not in any groups yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-zinc-800 p-4 rounded-lg shadow border border-zinc-700 space-y-2"
              >
                <h3 className="text-lg font-medium text-indigo-300">{group.name}</h3>

                <div className="flex justify-between text-sm text-gray-400">
                  <button
                    onClick={() => router.push(`/groups/${group.id}/availability`)}
                    className="hover:underline text-blue-400"
                  >
                    Open Group →
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(group.id);
                      toast.success('Copied!');
                    }}
                    className="hover:text-gray-300"
                  >
                    📋 Copy ID
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

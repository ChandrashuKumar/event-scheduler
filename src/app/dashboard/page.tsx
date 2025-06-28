'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState<any[]>([]);
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
      console.log('Group data:', data);
      setGroups(data);
      setGroupsLoading(false);
    };

    fetchGroups();
  }, [user, loading, router]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (!user) return null; // prevent flash of protected content

  return (
    <div className="p-8 space-y-4">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h1 className="text-xl font-bold">Dashboard</h1>
      <p>Welcome, {user?.displayName || user?.email}</p>

      <div className="space-x-4">
        <button
          onClick={() => router.push('/create-group')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ➕ Create Group
        </button>

        <button
          onClick={() => router.push('/join-group')}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          🔗 Join Group
        </button>

        <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Your Groups</h2>
        {groupsLoading ? (
          // Render skeleton placeholders
          <Skeleton count={3} width={300} baseColor="#313131" highlightColor="#525252" />
        ) : groups.length === 0 ? (
          <p>You’re not in any groups yet.</p>
        ) : (
          <ul className="list-disc list-inside">
            {groups.map((group) => (
              <li key={group.id} className="mb-4">
                <button
                  onClick={() => router.push(`/groups/${group.id}/availability`)}
                  className="text-blue-500 underline hover:text-blue-400 transition font-medium text-xl bg-transparent border-none p-0 m-0 cursor-pointer"
                >
                  {group.name}
                </button>

                <div className="mt-1 ml-4 flex gap-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(group.id);
                      toast.success('Group ID copied to clipboard');
                    }}
                    className="text-gray-300 hover:text-gray-400 transition-colors"
                  >
                    📋 Copy Group ID
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }

    const fetchGroups = async () => {
      if(!user) return;
      const token = await user?.getIdToken();
      const res = await fetch('/api/group/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      console.log('Group data:', data);
      setGroups(data);
    };

    fetchGroups();
  }, [user, loading, router]);

  if (loading) return <p className="p-8">Loading...</p>;
  if (!user) return null; // prevent flash of protected content

  return (
    <div className="p-8 space-y-4">
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

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Your Groups</h2>
        {loading ? (
          <p>Loading...</p>
        ) : groups.length === 0 ? (
          <p>You’re not in any groups yet.</p>
        ) : (
          <ul className="list-disc list-inside">
            {groups.map((group) => (
              <li key={group.id}>{group.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

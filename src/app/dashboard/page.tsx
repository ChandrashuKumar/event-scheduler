'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null; // prevent flash of protected content

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-xl mb-2">Dashboard</h1>
      <p>Welcome, {user.displayName || user.email}</p>

      <div className="space-x-4">
        <button
          onClick={() => router.push('/create-group')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          ➕ Create Group
        </button>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

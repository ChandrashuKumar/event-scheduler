'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login'); // Redirect if not logged in
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-xl mb-4">Dashboard</h1>
      {user && <>
      <p>Welcome, {user.displayName || user.email}</p>
      <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
      </button>
      </>}
    </div>
  );
}

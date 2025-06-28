'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // ⛔️ Prevent flash by rendering nothing while checking auth
  if (loading || user) return null;

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl mb-4">Login to Scheduler</h1>
      <button onClick={login} className="bg-blue-500 text-white px-4 py-2 rounded">
        Login with Google
      </button>
    </div>
  );
}

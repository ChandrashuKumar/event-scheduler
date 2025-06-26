'use client';
import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const token = await result.user.getIdToken();

    // Call your backend to sync user
    await fetch('/api/user/init', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    router.push('/dashboard'); // Redirect on success
  };

  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl mb-4">Login to Scheduler</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={login}
        disabled={loading}
      >
        {loading ? 'Logging in...' : 'Login with Google'}
      </button>
    </div>
  );
}

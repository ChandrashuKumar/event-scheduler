'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Michroma } from 'next/font/google';

const michroma = Michroma({ subsets: ['latin'], weight: '400' });

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white flex flex-col items-center justify-center relative px-4">
      {/* Top-left logo/brand */}
      <div
        className={`absolute top-6 left-6 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent ${michroma.className}`}
      >
        event-scheduler
      </div>

      {/* Center login card */}
      <div className="w-full max-w-md bg-zinc-800 rounded-xl p-8 shadow-lg border border-zinc-700 text-center space-y-6">
        <h1 className="text-2xl font-bold">Welcome to your Scheduler 🗓️</h1>
        <p className="text-gray-400 text-sm">Plan smarter. Meet smoother. 🌱</p>

        <div className="flex justify-center">
          <button
            onClick={login}
            className="bg-white text-zinc-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-3 transition cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.67 1.23 9.17 3.23l6.87-6.87C35.78 3.16 30.16 1 24 1 14.62 1 6.52 5.48 2.36 12.29l7.77 6.04C11.63 12.14 17.12 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.64 24.5c0-1.58-.14-3.1-.4-4.5H24v8.55h12.76c-.55 3-2.23 5.5-4.74 7.21l7.68 5.94C44.82 36.38 46.64 30.66 46.64 24.5z"
              />
              <path
                fill="#FBBC05"
                d="M10.13 28.27A13.58 13.58 0 0 1 9.5 24c0-1.26.22-2.48.63-3.63L2.36 12.29A23.09 23.09 0 0 0 1 24c0 3.91.94 7.62 2.64 10.89l7.49-6.61z"
              />
              <path
                fill="#34A853"
                d="M24 47c6.16 0 11.34-2.05 15.12-5.56l-7.21-5.94c-2.01 1.35-4.55 2.15-7.91 2.15-6.88 0-12.37-3.64-15.2-8.97l-7.49 6.61C6.52 42.52 14.62 47 24 47z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <span>Login with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}

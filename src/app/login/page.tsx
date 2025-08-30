'use client';

import { useEffect} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Michroma } from 'next/font/google';
import { Loader } from '@/components/ui/loader';
import { Sun, Moon } from 'lucide-react';

const michroma = Michroma({ subsets: ['latin'], weight: '400' });

export default function LoginPage() {
  const { user, loading, isLoggingIn, login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || user || isLoggingIn) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 text-zinc-900 dark:text-white flex items-center justify-center">
      <Loader size="xl" variant="dots" text={isLoggingIn ? "Signing you in..." : "Loading..."} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 text-zinc-900 dark:text-white flex flex-col items-center justify-center relative px-4">
      {/* Top-left logo/brand */}
      <div
        className={`absolute top-6 left-6 text-3xl sm:text-4xl font-bold bg-gradient-to-r from-zinc-600 via-zinc-500 to-zinc-400 dark:from-white dark:via-white dark:to-zinc-400 bg-clip-text text-transparent ${michroma.className}`}
      >
        conVene
      </div>

      {/* Theme toggle button - top right */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-lg bg-zinc-900/10 dark:bg-white/10 hover:bg-zinc-900/20 dark:hover:bg-white/20 transition-colors backdrop-blur-sm"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-zinc-700 dark:text-white/80" />
        ) : (
          <Moon className="w-5 h-5 text-zinc-700 dark:text-white/80" />
        )}
      </button>

      {/* Center login card */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-xl p-8 shadow-lg border border-zinc-200 dark:border-zinc-700 text-center space-y-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome to your Scheduler 🗓️</h1>
        <p className="text-zinc-500 dark:text-gray-400 text-sm">Plan smarter. Meet smoother. 🌱</p>

        <div className="flex justify-center">
          <button
            onClick={login}
            className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-3 transition cursor-pointer"
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

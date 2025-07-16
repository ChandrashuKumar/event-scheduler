'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While checking auth, avoid flash
  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  // If unauthenticated and not loading, don't render layout
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-base-100 overflow-hidden relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <header className="w-full px-4 py-3 border-b border-gray-700 flex items-center justify-between bg-base-200 text-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn btn-square btn-ghost md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto max-w-full bg-zinc-950 text-white">
          <LocalizationProvider dateAdapter={AdapterDateFns}>{children}</LocalizationProvider>
        </main>
      </div>
    </div>
  );
}

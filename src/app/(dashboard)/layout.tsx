'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/loader';

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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader size="xl" variant="dots" text="Loading..." />
      </div>
    );
  }

  // If unauthenticated and not loading, don't render layout
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <header className="w-full px-4 py-3 border-b border-border flex items-center justify-between bg-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto max-w-full bg-background text-foreground">{children}</main>
      </div>
    </div>
  );
}

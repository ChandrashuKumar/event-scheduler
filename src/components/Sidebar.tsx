'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LayoutDashboard, Plus, LogOut, User, X, Users, Sun, Moon, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/context/ThemeContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [{ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [groupError, setGroupError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGroupError('');
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/group/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: groupName }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Created group: ${result.name}`);
        setGroupName('');
        setIsCreateOpen(false);
        queryClient.invalidateQueries({ queryKey: ['groups'] });
      } else {
        if (result.error === 'You already have a group with this name') {
          setGroupError('You already created a group with this name.');
        } else {
          toast.error(result.error || 'Failed to create group.');
        }
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setGroupError('');
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/group/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId: groupCode }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(`Joined ${result.groupName} successfully!`);
        setGroupCode('');
        setIsJoinOpen(false);
        queryClient.invalidateQueries({ queryKey: ['groups'] });
      } else {
        if (result.error === 'You are already a member of this group') {
          setGroupError('You are already a member of this group.');
        } else {
          toast.error(result.error || 'Failed to join group.');
        }
      }
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside
      className={`
        fixed md:static top-0 left-0 h-full bg-sidebar border-r border-sidebar-border z-40
        transition-all duration-300 ease-in-out w-80 sm:w-72 shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        max-w-[85vw] md:max-w-none
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-sidebar-foreground truncate">EventSync</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Professional Scheduler</p>
          </div>
        </div>
        
        {/* Mobile Close + Theme Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button 
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 p-3 bg-sidebar-accent rounded-xl">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-sidebar rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sidebar-foreground truncate text-sm sm:text-base">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="space-y-2">
        {/* Main Navigation */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Navigation
          </h3>
          {navItems.map(({ name, icon: Icon, path }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={name}
                href={path}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg' 
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }
                `}
                onClick={onClose}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-sidebar-primary-foreground' : 'text-muted-foreground group-hover:text-sidebar-foreground'}`} />
                <span className="font-medium">{name}</span>
              </Link>
            );
          })}
        </div>

        {/* Group Actions */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Groups
          </h3>
          
          {/* Create Group Modal */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <button
                className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-xl text-sidebar-foreground hover:bg-sidebar-accent w-full transition-all duration-200 group"
                onClick={onClose}
              >
                <div className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                  <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-medium">Create Group</span>
              </button>
            </DialogTrigger>
          <DialogContent className="w-[22rem] max-w-full">
            <div className="mx-auto w-full max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-center">Create Group</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleCreateGroup} className="flex flex-col items-center gap-6 mt-4">
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-72 max-w-full px-4 py-2 rounded-lg bg-background dark:bg-input border border-input dark:border-border text-foreground focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-40 max-w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
                    isSubmitting
                      ? 'bg-muted cursor-not-allowed text-muted-foreground'
                      : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
                {groupError && <p className="text-destructive text-sm -mt-4">{groupError}</p>}
              </form>
            </div>
          </DialogContent>
        </Dialog>

          {/* Join Group Modal */}
          <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
            <DialogTrigger asChild>
              <button
                className="flex items-center cursor-pointer gap-3 px-3 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent w-full transition-all duration-200 group"
                onClick={onClose}
              >
                <div className="w-5 h-5 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">Join Group</span>
              </button>
            </DialogTrigger>
          <DialogContent className="w-[22rem] max-w-full">
            <div className="mx-auto w-full max-w-sm">
              <DialogHeader>
                <DialogTitle>Join Group</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleJoinGroup} className="flex flex-col items-center gap-6 mt-4">
                <input
                  type="text"
                  placeholder="Group Code"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background dark:bg-input border border-input dark:border-border text-foreground focus:outline-none focus:ring-2 focus:ring-pink-400"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-40 max-w-full font-semibold py-2 px-4 rounded-lg transition-colors ${
                    isSubmitting
                      ? 'bg-muted cursor-not-allowed text-muted-foreground'
                      : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  {isSubmitting ? 'Joining...' : 'Join'}
                </button>
                {groupError && <p className="text-destructive text-sm -mt-4">{groupError}</p>}
              </form>
            </div>
            </DialogContent>
          </Dialog>
        </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 sm:p-6 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200 w-full group"
        >
          <div className="w-5 h-5 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
            <LogOut className="w-3 h-3 text-red-600 dark:text-red-400" />
          </div>
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

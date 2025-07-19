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
import { LayoutDashboard, PlusSquare, LogOut, UserCircle, X, Group } from 'lucide-react';
import { toast } from 'react-toastify';
import { mutate } from 'swr';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [{ name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' }];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
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
        mutate(['/api/group/list', user]);
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
        mutate(['/api/group/list', user]);
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
        fixed md:static top-0 left-0 h-full bg-base-200 border-r border-base-300 z-40
        transition-transform duration-300 ease-in-out w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}
    >
      {/* Mobile Close Button */}
      <div className="md:hidden flex justify-end p-4">
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* User Info */}
      <div className="flex flex-col items-center p-4 lg:my-3 space-y-2">
        <UserCircle className="w-16 h-16 text-gray-500" />
        <p className="font-semibold text-lg">{user?.displayName}</p>
        <p className="text-sm opacity-70">{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-2">
        {/* Standard Links */}
        {navItems.map(({ name, icon: Icon, path }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={name}
              href={path}
              className={`
        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
        ${isActive ? 'bg-primary text-white' : 'text-gray-400 hover:bg-base-300'}
      `}
              onClick={onClose}
            >
              <Icon className="w-5 h-5" />
              <span>{name}</span>
            </Link>
          );
        })}

        {/* Create Group Modal */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button
              className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg text-gray-400 hover:bg-base-300 w-full"
              onClick={onClose}
            >
              <PlusSquare className="w-5 h-5" />
              <span>Create Group</span>
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
                  className="w-72 max-w-full px-4 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-40 max-w-full font-semibold py-2 px-4 rounded transition-colors ${
                    isSubmitting
                      ? 'bg-gray-500 cursor-not-allowed text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
                {groupError && <p className="text-red-500 text-sm -mt-4">{groupError}</p>}
              </form>
            </div>
          </DialogContent>
        </Dialog>

        {/* Join Group Modal */}
        <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
          <DialogTrigger asChild>
            <button
              className="flex items-center cursor-pointer gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-base-300 w-full"
              onClick={onClose}
            >
              <Group className="w-5 h-5" />
              <span>Join Group</span>
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
                  className="w-full px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-40 max-w-full font-semibold py-2 px-4 rounded transition-colors ${
                    isSubmitting
                      ? 'bg-gray-500 cursor-not-allowed text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isSubmitting ? 'Joining...' : 'Join'}
                </button>
                {groupError && <p className="text-red-500 text-sm -mt-4">{groupError}</p>}
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </nav>

      {/* Logout */}
      <div className="p-6 border-t border-base-300">
        <button
          onClick={logout}
          className="flex items-center gap-2 text-error transition-transform duration-200 hover:scale-[1.05] cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

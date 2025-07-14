'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import {
  LayoutDashboard,
  PlusSquare,
  LogOut,
  UserCircle,
  X,
  Group
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Create Group', icon: PlusSquare, path: '/create-group' },
  { name: 'Join Group', icon: Group, path: '/join-group' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const pathname = usePathname();

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
        {navItems.map(({ name, icon: Icon, path }) => {
          const isActive = pathname === path;
          return (
            <Link
              key={name}
              href={path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
                ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-base-300'}
              `}
              onClick={onClose}
            >
              <Icon className="w-5 h-5" />
              <span>{name}</span>
            </Link>
          );
        })}
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

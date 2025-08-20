'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Group } from '@/generated/prisma/client';
import { Loader } from '@/components/ui/loader';

interface GroupsSectionProps {
  groups: Group[];
  groupsLoading: boolean;
  leavingGroups: Set<string>;
  onLeaveGroup: (groupId: string, groupName: string) => Promise<void>;
}

const GroupsSection = ({
  groups,
  groupsLoading,
  leavingGroups,
  onLeaveGroup
}: GroupsSectionProps) => {
  const router = useRouter();

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Your Groups</h2>
          <p className="text-base font-medium text-foreground/80">Manage your team collaborations</p>
        </div>
      </div>

      {groupsLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-pink-100/30 dark:bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 bg-pink-100/40 dark:bg-card border border-border rounded-xl">
          <div className="w-12 h-12 bg-pink-200/60 dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-muted-foreground mb-2">No groups yet</p>
          <p className="text-sm text-muted-foreground">Create or join a group to get started</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-blue-50 dark:bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-semibold">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {group.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">Team collaboration</p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(group.id);
                    toast.success('Group ID copied!');
                  }}
                  className="p-1.5 hover:bg-muted rounded-lg transition-colors group/copy"
                  title="Copy Group ID"
                >
                  <svg className="w-4 h-4 text-muted-foreground group-hover/copy:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-between">
                <button
                  onClick={() =>
                    router.push(
                      `/groups/${group.id}/availability?name=${encodeURIComponent(group.name)}`
                    )
                  }
                  className="px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
                >
                  Open Group
                </button>
                
                <button
                  onClick={() => onLeaveGroup(group.id, group.name)}
                  disabled={leavingGroups.has(group.id)}
                  className="flex cursor-pointer items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {leavingGroups.has(group.id) && (
                    <Loader size="sm" variant="spinner" className="border-red-600 border-t-transparent dark:border-red-400" />
                  )}
                  Leave
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default GroupsSection;
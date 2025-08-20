import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type GroupMemberBasic = {
  id: string;
  name: string;
  email: string;
};

export default function GroupMembers({ 
  members, 
  loading = false 
}: { 
  members: GroupMemberBasic[]
  loading?: boolean 
}) {
  return (
    <div className="flex-1 bg-blue-50 dark:bg-card p-6 rounded-xl shadow-lg border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-1">Team Members</h2>
      <p className="text-sm text-muted-foreground mb-4">Invite your team members to collaborate.</p>

      {loading ? (
        <Skeleton
          count={3}
          height={50}
          baseColor="#313131"
          highlightColor="#525252"
          className="rounded-md"
        />
      ) : members.length > 0 ? (
        <ul className="space-y-4">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between bg-blue-100/50 dark:bg-muted/50 px-4 py-3 rounded-lg hover:bg-blue-100/70 dark:hover:bg-muted/70 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                  {m.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.email}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No team members found.</p>
      )}
    </div>
  );
}

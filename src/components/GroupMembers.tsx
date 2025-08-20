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
    <div className="flex-1 bg-zinc-800 p-6 rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-1">Team Members</h2>
      <p className="text-sm text-gray-400 mb-4">Invite your team members to collaborate.</p>

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
              className="flex items-center justify-between bg-zinc-700/40 px-4 py-3 rounded-md hover:bg-zinc-700/60 transition"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                  {m.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-medium text-white">{m.name}</p>
                  <p className="text-sm text-gray-400">{m.email}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400">No team members found.</p>
      )}
    </div>
  );
}

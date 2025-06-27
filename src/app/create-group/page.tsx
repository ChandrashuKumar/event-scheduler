'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await user?.getIdToken();

    const res = await fetch('/api/group/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: groupName }),
    });

    if (res.ok) {
      const data = await res.json();
      alert(`Group created: ${data.name}`);
      setGroupName('');
    } else {
      const error = await res.json();
      alert(`Error: ${error.error}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Create a Group</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name"
          className="w-full border px-4 py-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Create Group
        </button>
      </form>
    </div>
  );
}

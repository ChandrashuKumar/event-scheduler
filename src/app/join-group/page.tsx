'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function JoinGroupPage() {
  const [groupId, setGroupId] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await user?.getIdToken();

    const res = await fetch('/api/group/join', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupId }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(`Joined group: ${data.groupName || groupId}`);
      setGroupId('');
    } else {
      toast.error(`❌ ${data.error}`);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <ToastContainer position="top-right" autoClose={3000} theme='dark' />

      <h1 className="text-xl mb-4">Join Group</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          placeholder="Paste Group ID here"
          className="w-full border px-4 py-2 rounded"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Join Group
        </button>
      </form>
    </div>
  );
}

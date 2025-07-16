'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Availability } from '@/generated/prisma';

import AvailabilityForm from '@/components/AvailabilityForm';
import GroupMembers from '@/components/GroupMembers';
import AvailabilityList from '@/components/AvailabilityList';
import ResolvedSlots from '@/components/ResolvedSlots';


export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useAuth();

  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [status, setStatus] = useState('');

  const [entries, setEntries] = useState<Availability[]>([]);
  const [members, setMembers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const [resolved, setResolved] = useState<Record<string, { start: string; end: string }[]>>({});
  const [loadingResolved, setLoadingResolved] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user) return;
      setLoadingEntries(true);
      const token = await user.getIdToken();
      const res = await fetch(`/api/availability/list?groupId=${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEntries(data);
      setLoadingEntries(false);
    };

    const fetchMembers = async () => {
      if (!user) return;
      const token = await user.getIdToken();
      const res = await fetch(`/api/group/members?groupId=${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMembers(data);
    };

    fetchAvailability();
    fetchMembers();
  }, [user, groupId, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await user?.getIdToken();
    const res = await fetch('/api/availability/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ groupId, startDateTime, endDateTime }),
    });

    const result = await res.json();
    if (res.ok) {
      setStatus('✅ Availability submitted!');
      setStartDateTime('');
      setEndDateTime('');
    } else {
      setStatus(`❌ Error: ${result.error}`);
    }
  };

  const handleDelete = async (availabilityId: string) => {
    const token = await user?.getIdToken();
    const res = await fetch(`/api/availability/remove`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ availabilityId }),
    });

    if (res.ok) {
      toast.success('Availability deleted!');
      setEntries((prev) => prev.filter((entry) => entry.id !== availabilityId));
    } else {
      toast.error('Error deleting availability');
    }
  };

  const fetchResolvedSlots = async () => {
    setLoadingResolved(true);
    setShowResults(true);
    try {
      const res = await fetch(`/api/availability/resolve?groupId=${groupId}`);
      const data = await res.json();
      if (res.ok) {
        setResolved(data);
      } else {
        toast.error(data.error || 'Failed to resolve');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setLoadingResolved(false);
    }
  };

  return (
    <div className="p-4 sm:p-10 space-y-8 text-white bg-gray-900 min-h-screen overflow-x-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h1 className="text-2xl font-bold mb-6 text-center">Submit Availability</h1>

      {/* Form + Members Side-by-Side */}
      <div className="flex flex-col md:flex-row gap-8">
        <AvailabilityForm
          startDateTime={startDateTime}
          endDateTime={endDateTime}
          setStartDateTime={setStartDateTime}
          setEndDateTime={setEndDateTime}
          handleSubmit={handleSubmit}
          status={status}
        />

        <GroupMembers members={members} />
      </div>

      <AvailabilityList
        entries={entries}
        loading={loadingEntries}
        handleDelete={handleDelete}
      />

      {/* View Slots Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchResolvedSlots}
          className="bg-purple-700 hover:bg-purple-800 transition-colors cursor-pointer text-white px-5 py-2 rounded"
        >
          🧠 View Common Time Slots
        </button>
      </div>

      <ResolvedSlots
        showResults={showResults}
        loadingResolved={loadingResolved}
        resolved={resolved}
      />
    </div>
  );
}

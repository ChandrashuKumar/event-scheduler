'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AvailabilityForm from '@/components/AvailabilityForm';
import GroupMembers from '@/components/GroupMembers';
import AvailabilityList from '@/components/AvailabilityList';
import ResolvedSlots from '@/components/ResolvedSlots';
import { ButtonLoader} from '@/components/ui/loader';

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const groupName = searchParams?.get('name');

  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [status, setStatus] = useState('');
  const [resolved, setResolved] = useState<Record<string, { start: string; end: string }[]>>({});
  const [loadingResolved, setLoadingResolved] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [deletingAvailability, setDeletingAvailability] = useState<Set<string>>(new Set());

  const fetcherWithToken = async (url: string) => {
    const token = await user?.getIdToken();
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  };

  const {
    data: entries,
    isLoading: loadingEntries,
    mutate: mutateEntries,
  } = useSWR(user ? `/api/availability/list?groupId=${groupId}` : null, fetcherWithToken);

  const { data: members, isLoading: loadingMembers } = useSWR(
    user ? `/api/group/members?groupId=${groupId}` : null,
    fetcherWithToken
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Submitting...');
    try {
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
        mutateEntries(); // re-fetch availability list
        setTimeout(() => setStatus(''), 3000); // Clear success message after 3 seconds
      } else {
        setStatus(`❌ Error: ${result.error}`);
      }
    } catch {
      setStatus('❌ Error submitting availability');
    }
  };

  const handleDelete = async (availabilityId: string) => {
    setDeletingAvailability(prev => new Set(prev).add(availabilityId));
    try {
      const token = await user?.getIdToken();
      const res = await fetch('/api/availability/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ availabilityId }),
      });

      if (res.ok) {
        toast.success('Availability deleted!');
        mutateEntries();
      } else {
        toast.error('Error deleting availability');
      }
    } catch {
      toast.error('Server error');
    } finally {
      setDeletingAvailability(prev => {
        const newSet = new Set(prev);
        newSet.delete(availabilityId);
        return newSet;
      });
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
    <div className="pt-1 sm:pt-2 px-4 sm:px-8 pb-10 sm:pb-18 space-y-10 text-white bg-gray-900 min-h-screen overflow-x-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <h1 className="text-2xl font-bold text-center">Submit Availability</h1>
      {groupName && (
        <div className="text-center mb-10 -mt-4">
          <div className="inline-block">
            <h2 className="text-2xl sm:text-3xl font-semibold text-indigo-300 tracking-wide">
              {groupName}
            </h2>
            <div className="h-1 bg-indigo-300 mt-1 rounded-full" />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <AvailabilityForm
          startDateTime={startDateTime}
          endDateTime={endDateTime}
          setStartDateTime={setStartDateTime}
          setEndDateTime={setEndDateTime}
          handleSubmit={handleSubmit}
          status={status}
        />
        <GroupMembers members={members || []} loading={loadingMembers} />
      </div>

      <AvailabilityList
        entries={entries || []}
        loading={loadingEntries}
        handleDelete={handleDelete}
        deletingAvailability={deletingAvailability}
      />

      <div className="mt-6 text-center">
        <button
          onClick={fetchResolvedSlots}
          disabled={loadingResolved}
          className="bg-purple-700 hover:bg-purple-800 transition-colors cursor-pointer text-white px-5 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
        >
          {loadingResolved && <ButtonLoader />}
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

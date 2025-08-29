'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AvailabilityForm from '@/components/AvailabilityForm';
import GroupMembers from '@/components/GroupMembers';
import AvailabilityList from '@/components/AvailabilityList';
import ResolvedSlots from '@/components/ResolvedSlots';

export default function GroupPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const groupName = searchParams?.get('name');

  const [status, setStatus] = useState('');

  const fetcherWithToken = async (url: string) => {
    const token = await user?.getIdToken();
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    
    if (!res.ok) {
      const result = await res.json().catch(() => ({}));
      throw new Error(result.error || `HTTP ${res.status}: ${res.statusText}`);
    }
    
    return res.json();
  };

  const {
    data: entries,
    isLoading: loadingEntries,
    error: entriesError,
  } = useQuery({
    queryKey: ['availability', groupId],
    queryFn: () => fetcherWithToken(`/api/availability/list?groupId=${groupId}`),
    enabled: !!user && !!groupId,
  });

  // Handle entries error
  if (entriesError) {
    toast.error(`Failed to load availability: ${entriesError.message}`);
  }

  const { data: members, isLoading: loadingMembers, error: membersError } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => fetcherWithToken(`/api/group/members?groupId=${groupId}`),
    enabled: !!user && !!groupId,
  });

  // Handle members error
  if (membersError) {
    toast.error(`Failed to load group members: ${membersError.message}`);
  }

  const submitAvailabilityMutation = useMutation({
    mutationFn: async ({ groupId, startDateTime, endDateTime }: {
      groupId: string;
      startDateTime: string;
      endDateTime: string;
    }) => {
      const token = await user?.getIdToken();
      const res = await fetch('/api/availability/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId, startDateTime, endDateTime }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error);
      }
      return result;
    },
    onSuccess: () => {
      setStatus('✅ Availability submitted!');
      queryClient.invalidateQueries({ queryKey: ['availability', groupId] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      setTimeout(() => setStatus(''), 3000);
    },
    onError: (error: Error) => {
      setStatus(`❌ Error: ${error.message}`);
    },
  });

  const handleSubmitAvailability = async (data: { startDateTime: string; endDateTime: string }) => {
    if (!user || !groupId) return;
    
    setStatus('Submitting...');
    try {
      await submitAvailabilityMutation.mutateAsync({
        groupId: groupId as string,
        ...data,
      });
    } catch {
      setStatus('❌ Error submitting availability');
    }
  };

  const deleteAvailabilityMutation = useMutation({
    mutationFn: async (availabilityId: string) => {
      const token = await user?.getIdToken();
      const res = await fetch('/api/availability/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ availabilityId }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Error deleting availability');
      }
      return result;
    },
    onSuccess: () => {
      toast.success('Availability deleted!');
      queryClient.invalidateQueries({ queryKey: ['availability', groupId] });
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
    },
    onError: () => {
      toast.error('Error deleting availability');
    },
  });

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!user) return;
    
    try {
      await deleteAvailabilityMutation.mutateAsync(availabilityId);
    } catch {
      toast.error('Server error');
    }
  };

  const handleResolveSlots = async () => {
    const res = await fetch(`/api/availability/resolve?groupId=${groupId}`);
    const data = await res.json();
    if (res.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Failed to resolve');
    }
  };


  return (
    <div className="pt-1 sm:pt-2 px-4 sm:px-8 pb-10 sm:pb-18 space-y-10 text-foreground bg-background min-h-screen overflow-x-hidden">
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
      <h1 className="text-2xl font-bold text-center text-foreground">Submit Availability</h1>
      {groupName && (
        <div className="text-center mb-10 -mt-4">
          <div className="inline-block">
            <h2 className="text-2xl sm:text-3xl font-semibold text-pink-600 dark:text-pink-400 tracking-wide">
              {groupName}
            </h2>
            <div className="h-1 bg-pink-600 dark:bg-pink-400 mt-1 rounded-full" />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <AvailabilityForm
          onSubmit={handleSubmitAvailability}
          isSubmitting={submitAvailabilityMutation.isPending}
          status={status}
          existingEntries={entries || []}
        />
        <GroupMembers members={members || []} loading={loadingMembers} />
      </div>

      <AvailabilityList
        entries={entries || []}
        loading={loadingEntries}
        onDelete={handleDeleteAvailability}
      />

      <ResolvedSlots
        groupId={groupId as string}
        onResolve={handleResolveSlots}
      />
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

export const useGroupManagement = () => {
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [groupError, setGroupError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
        queryClient.invalidateQueries({ queryKey: ['groups'] });
        return { success: true };
      } else {
        if (result.error === 'You already have a group with this name') {
          setGroupError('You already created a group with this name.');
        } else {
          toast.error(result.error || 'Failed to create group.');
        }
        return { success: false };
      }
    } catch {
      toast.error('Something went wrong.');
      return { success: false };
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
        queryClient.invalidateQueries({ queryKey: ['groups'] });
        return { success: true };
      } else {
        if (result.error === 'You are already a member of this group') {
          setGroupError('You are already a member of this group.');
        } else {
          toast.error(result.error || 'Failed to join group.');
        }
        return { success: false };
      }
    } catch {
      toast.error('Something went wrong.');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setGroupName('');
    setGroupCode('');
    setGroupError('');
  };

  return {
    groupName,
    setGroupName,
    groupCode,
    setGroupCode,
    groupError,
    isSubmitting,
    handleCreateGroup,
    handleJoinGroup,
    resetForm,
  };
};
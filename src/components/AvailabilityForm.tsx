'use client';
import { useEffect, useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/analog_time_picker';
import { ButtonLoader } from '@/components/ui/loader';

interface Props {
  onSubmit: (data: { startDateTime: string; endDateTime: string }) => Promise<void>;
  isSubmitting: boolean;
  status: string;
  existingEntries?: Array<{ startDateTime: string; endDateTime: string }>;
}

export default function AvailabilityForm({
  onSubmit,
  isSubmitting,
  status,
  existingEntries = [],
}: Props) {
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [localError, setLocalError] = useState('');
  const [overlapInfo, setOverlapInfo] = useState('');

  useEffect(() => {
    if (!startDateTime || !endDateTime) {
      setLocalError('');
      setOverlapInfo('');
      return;
    }

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    // Check if start time is before end time
    if (start >= end) {
      setLocalError('Start time must be before end time.');
      return;
    }

    // Check for exact duplicates (same start AND end time, ignoring milliseconds)
    const isDuplicate = existingEntries.some(entry => {
      const existingStart = new Date(entry.startDateTime);
      const existingEnd = new Date(entry.endDateTime);
      
      // Compare only date, hour, and minute (ignore seconds/milliseconds)
      const isSameStart = 
        start.getFullYear() === existingStart.getFullYear() &&
        start.getMonth() === existingStart.getMonth() &&
        start.getDate() === existingStart.getDate() &&
        start.getHours() === existingStart.getHours() &&
        start.getMinutes() === existingStart.getMinutes();
        
      const isSameEnd = 
        end.getFullYear() === existingEnd.getFullYear() &&
        end.getMonth() === existingEnd.getMonth() &&
        end.getDate() === existingEnd.getDate() &&
        end.getHours() === existingEnd.getHours() &&
        end.getMinutes() === existingEnd.getMinutes();
        
      return isSameStart && isSameEnd;
    });

    if (isDuplicate) {
      setLocalError('You already have availability for this exact time period.');
      setOverlapInfo('');
    } else {
      setLocalError('');
      
      // Check for overlaps (not duplicates) to show helpful info
      const hasOverlap = existingEntries.some(entry => {
        const existingStart = new Date(entry.startDateTime);
        const existingEnd = new Date(entry.endDateTime);
        
        // Check if times overlap (but not exact duplicates)
        return (start < existingEnd && end > existingStart);
      });
      
      if (hasOverlap) {
        setOverlapInfo('This overlaps with existing availability - that\'s totally fine!');
      } else {
        setOverlapInfo('');
      }
    }
  }, [startDateTime, endDateTime, existingEntries]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (localError) return;
    
    await onSubmit({ startDateTime, endDateTime });
    // Clear form on successful submit (status will be managed by parent)
    if (!status.includes('Error')) {
      setStartDateTime('');
      setEndDateTime('');
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex-1 space-y-10 bg-pink-100/40 dark:bg-card p-6 rounded-xl shadow-lg border border-border"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block font-semibold text-foreground mb-4">Start Date & Time</label>
          <DatePicker
            value={startDateTime}
            onChange={(val) => setStartDateTime(val?.toDate()?.toISOString() || '')}
            format="YYYY/MM/DD HH:mm"
            plugins={[<TimePicker key="start-time" hideSeconds />]}
            containerClassName="w-full"
            className="bg-background dark:bg-input text-black"
            inputClass="w-full px-4 py-2 bg-background dark:bg-input text-foreground placeholder-muted-foreground border border-input dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            placeholder="Select"
          />
        </div>

        <div className="flex-1">
          <label className="block font-semibold text-foreground mb-4">End Date & Time</label>
          <DatePicker
            value={endDateTime}
            onChange={(val) => setEndDateTime(val?.toDate()?.toISOString() || '')}
            format="YYYY/MM/DD HH:mm"
            plugins={[<TimePicker key="end-time" hideSeconds />]}
            className="bg-background dark:bg-input text-black"
            containerClassName="w-full"
            inputClass="w-full px-4 py-2 bg-background dark:bg-input text-foreground placeholder-muted-foreground border border-input dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            placeholder="Select"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSubmitting || !!localError}
          className="bg-pink-500 hover:bg-pink-600 transition-colors text-white px-6 py-2 rounded-lg font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <ButtonLoader />}
          ✅ Submit Availability
        </button>
      </div>

      {status && (
        <div className="text-sm mt-4 text-center bg-blue-100/50 dark:bg-muted text-foreground py-2 px-3 rounded-lg">
          {status}
        </div>
      )}
      {localError && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
          <p className="text-red-400 text-sm font-medium flex items-center justify-center gap-2">
            <span className="text-red-500">⚠️</span>
            {localError}
          </p>
        </div>
      )}
      {overlapInfo && !localError && (
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
          <p className="text-blue-400 text-sm font-medium flex items-center justify-center gap-2">
            <span className="text-blue-500">ℹ️</span>
            {overlapInfo}
          </p>
        </div>
      )}
    </form>
  );
}

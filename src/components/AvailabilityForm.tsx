'use client';

import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/analog_time_picker';

interface Props {
  startDateTime: string;
  endDateTime: string;
  setStartDateTime: (val: string) => void;
  setEndDateTime: (val: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  status: string;
}

export default function AvailabilityForm({
  startDateTime,
  endDateTime,
  setStartDateTime,
  setEndDateTime,
  handleSubmit,
  status,
}: Props) {
  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 space-y-10 bg-zinc-800 p-6 rounded-xl shadow-lg border border-zinc-700"
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block font-semibold text-white mb-4">Start Date & Time</label>
          <DatePicker
            value={startDateTime}
            onChange={(val) => setStartDateTime(val?.toDate()?.toISOString() || '')}
            format="YYYY/MM/DD HH:mm"
            plugins={[<TimePicker key="start-time" hideSeconds />]}
            containerClassName="w-full"
            className="bg-dark text-black"
            inputClass="w-full px-4 py-2 bg-zinc-900 text-white placeholder-gray-400 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            placeholder="Select"
          />
        </div>

        <div className="flex-1">
          <label className="block font-semibold text-white mb-4">End Date & Time</label>
          <DatePicker
            value={endDateTime}
            onChange={(val) => setEndDateTime(val?.toDate()?.toISOString() || '')}
            format="YYYY/MM/DD HH:mm"
            plugins={[<TimePicker key="end-time" hideSeconds />]}
            className="bg-dark text-black"
            containerClassName="w-full"
            inputClass="w-full px-4 py-2 bg-zinc-900 text-white placeholder-gray-400 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            placeholder="Select"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 transition-colors text-white px-6 py-2 rounded font-semibold cursor-pointer"
        >
          ✅ Submit Availability
        </button>
      </div>

      {status && (
        <div className="text-sm mt-2 text-center bg-zinc-700 text-white py-2 px-3 rounded">
          {status}
        </div>
      )}
    </form>
  );
}

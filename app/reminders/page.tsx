'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  description: string;
  time: string;
  frequency: string;
  channel: string;
  enabled: boolean;
}

export default function RemindersAdmin() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      // Transform cronJobs to reminders format
      const transformedReminders = data.cronJobs?.map((job: any) => ({
        id: job.id,
        title: job.name,
        description: job.action?.message || job.action?.prompt || '',
        time: formatTime(job.schedule),
        frequency: 'daily',
        channel: job.action?.channel || 'System',
        enabled: true
      })) || [];
      setReminders(transformedReminders);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (schedule: string) => {
    if (!schedule) return '--:--';
    const parts = schedule.split(' ');
    if (parts.length >= 2) {
      const [min, hour] = parts;
      return `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    }
    return schedule;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automated Reminders</h1>
          <p className="mt-2 text-gray-600">Manage your automated reminder notifications</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Reminder
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reminders.map((reminder) => (
              <tr key={reminder.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{reminder.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{reminder.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{reminder.time}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    reminder.channel === 'whatsapp' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {reminder.channel}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{reminder.frequency}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    reminder.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {reminder.enabled ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 hover:text-blue-700 mr-3">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

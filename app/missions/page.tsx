'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  icon: string;
  progress: number;
  deadline: string;
  current_value: number;
  target_value: number;
  unit: string;
  status: 'on-track' | 'at-risk' | 'delayed';
  key_actions: Array<{ id: string; text: string; completed: boolean }>;
}

export default function MissionsAdmin() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Mission>>({});

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('/api/missions');
      const data = await response.json();
      setMissions(data);
    } catch (error) {
      console.error('Failed to fetch missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (mission: Mission) => {
    setEditingId(mission.id);
    setFormData(mission);
  };

  const handleSave = async () => {
    try {
      await fetch('/api/missions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      await fetchMissions();
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error('Failed to save mission:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mission?')) return;

    try {
      await fetch(`/api/missions?id=${id}`, { method: 'DELETE' });
      await fetchMissions();
    } catch (error) {
      console.error('Failed to delete mission:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Missions</h1>
          <p className="mt-2 text-gray-600">Manage your mission control center items</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Add Mission
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {missions.map((mission) => (
              <tr key={mission.id} className="hover:bg-gray-50">
                {editingId === mission.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full rounded border px-2 py-1"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={formData.progress || 0}
                        onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                        className="w-20 rounded border px-2 py-1"
                        min="0"
                        max="100"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="date"
                        value={formData.deadline || ''}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="rounded border px-2 py-1"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={formData.status || ''}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="rounded border px-2 py-1"
                      >
                        <option value="on-track">On Track</option>
                        <option value="at-risk">At Risk</option>
                        <option value="delayed">Delayed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={formData.target_value || 0}
                        onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) })}
                        className="w-20 rounded border px-2 py-1"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-700 mr-3"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setFormData({}); }}
                        className="text-gray-600 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{mission.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{mission.progress}%</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{mission.deadline}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                        mission.status === 'on-track' ? 'bg-green-100 text-green-800' :
                        mission.status === 'at-risk' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {mission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {mission.current_value}/{mission.target_value} {mission.unit}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(mission)}
                        className="text-blue-600 hover:text-blue-700 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(mission.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Target, TrendingUp, DollarSign, Clock, CheckCircle2, AlertCircle, Award, Users } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  deadline: string;
  daysLeft: number;
  priority: 'critical' | 'high' | 'medium';
  progress: number;
  current: string;
  target: string;
  icon: any;
  color: string;
  urgency: string;
  keyActions: Array<{ id: string; text: string; completed: boolean }>;
}

interface DbMission {
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

const iconMap: Record<string, any> = {
  Award: Award,
  Users: Users,
  TrendingUp: TrendingUp,
  DollarSign: DollarSign,
  Target: Target,
  Clock: Clock
};

const colorMap: Record<string, string> = {
  nabh: 'red',
  occupancy: 'blue',
  revenue: 'green',
  esic: 'orange'
};

export default function EnhancedMissionCards() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const response = await fetch('/api/missions');
      if (!response.ok) throw new Error('Failed to fetch missions');

      const dbMissions: DbMission[] = await response.json();
      const transformedMissions = dbMissions.map(transformMission);
      setMissions(transformedMissions);
    } catch (err) {
      setError('Failed to load missions');
      console.error('Error fetching missions:', err);
    } finally {
      setLoading(false);
    }
  };

  const transformMission = (dbMission: DbMission): Mission => {
    // Parse YYYY-MM-DD as local midnight, not UTC
    const [year, month, day] = dbMission.deadline.split('-').map(Number);
    const deadlineDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to midnight for accurate day count
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const priority: 'critical' | 'high' | 'medium' =
      daysLeft <= 15 ? 'critical' :
      daysLeft <= 60 ? 'high' : 'medium';

    const urgency =
      daysLeft <= 15 ? `CRITICAL - ${daysLeft} DAYS` :
      `HIGH - ${daysLeft} DAYS`;

    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    // Add defensive checks for unit field
    const unit = dbMission.unit || 'items';
    const current = `${dbMission.current_value}${unit === 'lakh' ? 'L' : ''}`;
    const target = `${dbMission.target_value} ${unit}`;

    return {
      id: dbMission.id,
      title: dbMission.title,
      deadline: formattedDeadline,
      daysLeft,
      priority,
      progress: dbMission.progress,
      current,
      target,
      icon: iconMap[dbMission.icon] || Target,
      color: colorMap[dbMission.id] || 'blue',
      urgency,
      keyActions: dbMission.key_actions || []
    };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border-2 rounded-lg p-6 bg-gray-100 animate-pulse h-80" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      default: return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-600';
    if (progress >= 50) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {missions.map((mission) => {
        const Icon = mission.icon;
        return (
          <div
            key={mission.id}
            className={`border-2 rounded-lg p-6 hover:shadow-xl transition-all ${getPriorityColor(mission.priority)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full bg-${mission.color}-200`}>
                  <Icon className={`w-6 h-6 text-${mission.color}-700`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{mission.title}</h3>
                  <p className="text-sm text-gray-600">{mission.deadline}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                mission.priority === 'critical' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
              }`}>
                {mission.urgency}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">Progress</span>
                <span className="text-sm font-bold text-gray-900">{mission.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getProgressColor(mission.progress)}`}
                  style={{ width: `${mission.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">Current: {mission.current}</span>
                <span className="text-xs text-gray-600">Target: {mission.target}</span>
              </div>
            </div>

            {/* Key Actions */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Key Actions:</p>
              {(mission.keyActions || []).map((action) => (
                <div key={action.id} className="flex items-start gap-2">
                  {action.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={`text-xs ${action.completed ? 'text-gray-700 line-through' : 'text-gray-700'}`}>
                    {action.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Days Left Indicator */}
            <div className="mt-4 pt-4 border-t border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Days Remaining</span>
                <span className={`text-lg font-bold ${
                  mission.daysLeft <= 15 ? 'text-red-600' : 'text-gray-800'
                }`}>
                  {mission.daysLeft} days
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

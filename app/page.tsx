'use client';

import { useEffect, useState } from 'react';
import DashboardHeader from './components/DashboardHeader';
import RealTimeStatusBar from './components/RealTimeStatusBar';
import EnhancedMissionCards from './components/EnhancedMissionCards';
import SmartNotificationPanel from './components/SmartNotificationPanel';
import DailySchedule from './components/DailySchedule';
import TaskList from './components/TaskList';
import CronJobs from './components/CronJobs';
import HospitalStatus from './components/HospitalStatus';
import ProjectsOverview from './components/ProjectsOverview';
import ZoomMeetings from './components/ZoomMeetings';
import ConnectedDevices from './components/ConnectedDevices';
import { RefreshCw } from 'lucide-react';

interface DashboardData {
  tasks: any[];
  cronJobs: any[];
  schedule: any[];
  profile: any;
  lastUpdated: string;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/tasks');
      const result = await response.json();
      setData(result);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading ClawdBot Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />

        {/* Real-Time Status Bar */}
        <RealTimeStatusBar />

        {/* Connected Devices */}
        <div className="mb-6">
          <ConnectedDevices />
        </div>

        {/* Action Bar with Refresh and Notifications */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            Last updated: {data ? new Date(data.lastUpdated).toLocaleString() : 'Never'}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <SmartNotificationPanel />
          </div>
        </div>

        {/* Enhanced Mission Cards */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mission Control Center</h2>
          <EnhancedMissionCards />
        </div>

        {/* Original Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DailySchedule schedule={data?.schedule || []} />
          <TaskList tasks={data?.tasks || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CronJobs cronJobs={data?.cronJobs || []} />
          <HospitalStatus />
        </div>

        <div className="mb-6">
          <ProjectsOverview />
        </div>

        {/* Zoom Meetings Section */}
        <div className="mb-6">
          <ZoomMeetings />
        </div>

        <footer className="text-center text-sm text-gray-500 py-6 border-t">
          <p>OpenClaw Dashboard v1.1 | Enhanced with NABH Mission Tracking | Built for Dr. Murali BK | 2026-02-02</p>
          <p className="mt-1">
            Repository:{' '}
            <a href="https://github.com/chatgptnotes/bot" className="text-blue-600 hover:underline">
              github.com/chatgptnotes/bot
            </a>
          </p>
          <p className="mt-2 text-xs text-gray-400">
            🎯 NABH Audit: Feb 13-14, 2026 | 🏥 Occupancy Goal: 75 beds | 💻 Revenue Target: ₹30L/month | 💰 ESIC: ₹1 Crore
          </p>
        </footer>
      </div>
    </div>
  );
}

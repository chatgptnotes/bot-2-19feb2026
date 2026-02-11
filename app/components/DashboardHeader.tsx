'use client';

import { Activity, LogOut, User } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function DashboardHeader() {
  const { user, logout } = useAuth();

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8" />
            <h1 className="text-3xl font-bold">OpenClaw Dashboard</h1>
          </div>
          <p className="text-blue-100">Dr. Murali BK - AI-Powered Task Management</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-4 mb-2">
            {user && (
              <>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </>
            )}
          </div>
          <div className="text-4xl font-bold">{currentTime}</div>
          <div className="text-blue-100">{currentDate}</div>
        </div>
      </div>
    </div>
  );
}

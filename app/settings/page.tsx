'use client';

import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Send, Loader } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    checkWhatsAppStatus();
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/send');
      const data = await response.json();
      setWhatsappStatus(data);
    } catch (error) {
      console.error('Failed to check WhatsApp status:', error);
    }
  };

  const sendTestMessage = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/whatsapp/test');
      const data = await response.json();
      setTestResult(data);
    } catch (error: any) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.fullName || 'Not set'}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">WhatsApp Integration</h2>

          {whatsappStatus && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                {whatsappStatus.configured ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${whatsappStatus.configured ? 'text-green-600' : 'text-red-600'}`}>
                  {whatsappStatus.message}
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <div>Account SID: {whatsappStatus.hasAccountSid ? '✓' : '✗'}</div>
                <div>Auth Token: {whatsappStatus.hasAuthToken ? '✓' : '✗'}</div>
                <div>From Number: {whatsappStatus.hasFromNumber ? '✓' : '✗'}</div>
                <div>To Number: {whatsappStatus.hasToNumber ? '✓' : '✗'}</div>
              </div>
            </div>
          )}

          {!whatsappStatus?.configured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm">
              <p className="font-semibold text-yellow-900 mb-1">Setup Required:</p>
              <ol className="list-decimal list-inside text-yellow-800 space-y-1">
                <li>Get Twilio credentials from <a href="https://console.twilio.com" target="_blank" className="underline">console.twilio.com</a></li>
                <li>Update TWILIO_* values in .env.local file</li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={sendTestMessage}
              disabled={testing || !whatsappStatus?.configured}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Test Message
                </>
              )}
            </button>
            <button
              onClick={checkWhatsAppStatus}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Refresh Status
            </button>
          </div>

          {testResult && (
            <div className={`mt-4 p-3 rounded ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-semibold">{testResult.success ? 'Success!' : 'Failed'}</p>
              <p className="text-sm">{testResult.message || testResult.error}</p>
              {testResult.messageSid && (
                <p className="text-xs mt-1">Message SID: {testResult.messageSid}</p>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Configuration</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your dashboard is connected to Supabase for data management.
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Test Connection
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
              View Logs
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a href="/" className="block text-blue-600 hover:text-blue-700">
              → Go to Main Dashboard
            </a>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener" className="block text-blue-600 hover:text-blue-700">
              → Open Supabase Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

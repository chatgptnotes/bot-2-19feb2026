'use client'
import { Smartphone, Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Device {
  id: string
  name: string
  type: 'iphone' | 'android' | 'desktop' | 'glasses'
  connected: boolean
  lastSeen: Date
  ipAddress?: string
  application?: string
  reachable?: boolean | null  // null = untested, true = reachable, false = not reachable
  testing?: boolean           // true while test is running
}

export default function ConnectedDevices() {
  const [devices, setDevices] = useState<Device[]>([])

  useEffect(() => {
    // Fetch device data
    fetchDevices()

    // Refresh every 30 seconds
    const interval = setInterval(fetchDevices, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/devices')
      const data = await response.json()

      if (data.devices) {
        // Convert lastSeen ISO strings back to Date objects
        const devicesWithDates = data.devices.map((d: Omit<Device, 'lastSeen'> & { lastSeen: string }) => ({
          ...d,
          lastSeen: new Date(d.lastSeen)
        }))
        setDevices(devicesWithDates)
      }
    } catch {
      // Keep existing devices on error (don't clear the list)
    }
  }

  const testConnection = async (device: Device) => {
    if (!device.ipAddress) return

    // Set testing state
    setDevices(prev => prev.map(d =>
      d.id === device.id ? { ...d, testing: true } : d
    ))

    try {
      const response = await fetch('/api/devices/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress: device.ipAddress })
      })

      const result = await response.json()

      // Update device reachability status
      setDevices(prev => prev.map(d =>
        d.id === device.id
          ? { ...d, reachable: result.reachable, testing: false }
          : d
      ))
    } catch {
      setDevices(prev => prev.map(d =>
        d.id === device.id
          ? { ...d, reachable: false, testing: false }
          : d
      ))
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Wifi className="w-5 h-5 text-blue-600" />
          Connected Devices
        </h2>
        <span className="text-sm text-gray-500">
          {devices.filter(d => d.connected).length} online
        </span>
      </div>

      <div className="space-y-3">
        {devices.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <WifiOff className="w-12 h-12 mx-auto mb-2" />
            <p>No devices connected</p>
          </div>
        ) : (
          devices.map(device => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                <Smartphone className={`w-5 h-5 ${device.connected ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <div className="font-medium text-gray-900">{device.name}</div>
                  {device.application && (
                    <div className="text-sm text-gray-500">{device.application}</div>
                  )}
                  {device.ipAddress && (
                    <div className="text-xs text-gray-400">{device.ipAddress}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Connection Status Indicator - Based on App Activity (Timestamp) */}
                {device.connected ? (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatLastSeen(device.lastSeen)}
                  </span>
                )}

                {/* Test Gateway Button - Manual Only */}
                {device.ipAddress && (
                  <button
                    onClick={() => testConnection(device)}
                    disabled={device.testing}
                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    title="Test gateway health"
                  >
                    {device.testing ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Testing...
                      </span>
                    ) : (
                      'Test Gateway'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {devices.some(d => d.connected) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ✓ Gateway active at localhost:18789
          </p>
        </div>
      )}
    </div>
  )
}

function formatLastSeen(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

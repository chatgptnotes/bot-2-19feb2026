import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { CONNECTED_THRESHOLD_MS, errorResponse } from '@/lib/utils'

interface PairedDevice {
  deviceId?: string
  clientId?: string
  userAgent?: string
  platform?: string
  remote?: string
  lastUsedAtMs?: number
  createdAtMs?: number
  role?: string
  mode?: string
}

interface DeviceResponse {
  id: string
  name: string
  type: 'iphone' | 'android' | 'desktop' | 'glasses'
  connected: boolean
  lastSeen: string
  ipAddress?: string
  application?: string
}

export async function GET() {
  try {
    const pairedFilePath = path.join(
      process.env.HOME || '/Users/murali',
      '.openclaw',
      'devices',
      'paired.json'
    )

    if (!existsSync(pairedFilePath)) {
      return NextResponse.json({ devices: [], timestamp: new Date().toISOString() })
    }

    const fileContent = await readFile(pairedFilePath, 'utf-8')
    const pairedDevices: Record<string, PairedDevice> = JSON.parse(fileContent)

    const now = Date.now()

    const devices: DeviceResponse[] = []

    // Process each paired device
    for (const [deviceId, device] of Object.entries(pairedDevices)) {
      // Skip if no lastUsedAtMs (never used)
      if (!device.lastUsedAtMs) continue

      const lastSeenMs = device.lastUsedAtMs
      const timeSinceLastSeen = now - lastSeenMs
      const isConnected = timeSinceLastSeen < CONNECTED_THRESHOLD_MS

      // Detect device type and name
      let deviceType: DeviceResponse['type'] = 'desktop'
      let deviceName = 'Unknown Device'
      let application = undefined

      // Check user agent for iPhone/VisionClaw
      if (device.userAgent?.includes('iPhone')) {
        deviceType = 'iphone'
        deviceName = "Dr Murali BK's iPhone"

        // Check if this is VisionClaw app
        if (device.userAgent.includes('VisionClaw') ||
            device.clientId?.includes('vision') ||
            device.mode === 'visionclaw') {
          application = 'VisionClaw'
        }
      } else if (device.userAgent?.includes('Android')) {
        deviceType = 'android'
        deviceName = 'Android Device'
      } else if (device.clientId === 'openclaw-control-ui' || device.clientId === 'clawdbot-control-ui') {
        deviceType = 'desktop'
        deviceName = 'Control UI'
        application = device.clientId
      } else if (device.mode === 'cli') {
        deviceType = 'desktop'
        deviceName = 'OpenClaw CLI'
        application = 'CLI'
      }

      devices.push({
        id: deviceId,
        name: deviceName,
        type: deviceType,
        connected: isConnected,
        lastSeen: new Date(lastSeenMs).toISOString(),
        ipAddress: device.remote,
        application
      })
    }

    // Sort by last seen (most recent first)
    devices.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime())

    return NextResponse.json({
      devices,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return errorResponse('Failed to read device data', error);
  }
}

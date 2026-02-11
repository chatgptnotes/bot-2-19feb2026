import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { ipAddress } = await request.json()

    if (!ipAddress) {
      return NextResponse.json({
        reachable: false,
        error: 'No IP address provided'
      })
    }

    // Try to reach the gateway via HTTP
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000) // 3 second timeout

    try {
      const response = await fetch(`http://${ipAddress}:18789/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      })

      clearTimeout(timeout)

      return NextResponse.json({
        reachable: response.ok,
        status: response.status,
        timestamp: new Date().toISOString()
      })
    } catch (error: any) {
      clearTimeout(timeout)

      return NextResponse.json({
        reachable: false,
        error: error.name === 'AbortError' ? 'Timeout' : error.message,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      reachable: false,
      error: error.message
    }, { status: 500 })
  }
}

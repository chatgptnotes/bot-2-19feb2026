import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

    // Send a test WhatsApp message
    const response = await fetch(`${appUrl}/api/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `🤖 OpenClaw WhatsApp Test\n\nIf you received this message, WhatsApp integration is working correctly!\n\nTime: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n✅ Powered by OpenClaw CLI`
      })
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Test WhatsApp message sent successfully',
        ...data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test message',
        ...data
      }, { status: response.status });
    }

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}

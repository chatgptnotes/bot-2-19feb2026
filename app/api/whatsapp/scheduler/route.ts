import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// This endpoint checks for scheduled reminders and sends them
export async function GET() {
  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Get all enabled reminders for the current time
    const { data: reminders, error } = await supabaseAdmin
      .from('automated_reminders')
      .select('*')
      .eq('enabled', true)
      .eq('time', currentTime + ':00'); // Format: "07:00:00"

    if (error) {
      throw error;
    }

    const results = [];

    // Send WhatsApp message for each reminder with whatsapp channel
    for (const reminder of reminders || []) {
      if (reminder.channel === 'whatsapp') {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/whatsapp/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `${reminder.title}\n\n${reminder.description}`
            })
          });

          const data = await response.json();

          results.push({
            reminderId: reminder.id,
            title: reminder.title,
            success: response.ok,
            ...data
          });

          // Log the sent reminder
          await supabaseAdmin
            .from('reminder_logs')
            .insert({
              reminder_id: reminder.id,
              sent_at: now.toISOString(),
              status: response.ok ? 'sent' : 'failed',
              message: reminder.description
            });

        } catch (error: any) {
          results.push({
            reminderId: reminder.id,
            title: reminder.title,
            success: false,
            error: error.message
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      currentTime,
      remindersChecked: reminders?.length || 0,
      messagesSent: results.filter(r => r.success).length,
      results
    });

  } catch (error: any) {
    console.error('Scheduler error:', error);
    return NextResponse.json(
      { error: 'Scheduler failed', details: error.message },
      { status: 500 }
    );
  }
}

// Manual trigger endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reminderId } = body;

    if (!reminderId) {
      return NextResponse.json(
        { error: 'reminderId is required' },
        { status: 400 }
      );
    }

    // Get the specific reminder
    const { data: reminder, error } = await supabaseAdmin
      .from('automated_reminders')
      .select('*')
      .eq('id', reminderId)
      .single();

    if (error || !reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      );
    }

    // Send WhatsApp message
    if (reminder.channel === 'whatsapp') {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `${reminder.title}\n\n${reminder.description}`
        })
      });

      const data = await response.json();

      return NextResponse.json({
        success: response.ok,
        reminder: reminder.title,
        ...data
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Reminder is not configured for WhatsApp'
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Manual trigger failed', details: error.message },
      { status: 500 }
    );
  }
}

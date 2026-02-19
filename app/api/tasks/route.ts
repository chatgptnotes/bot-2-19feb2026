import { NextResponse } from 'next/server';
import { getUserProfile } from '@/lib/clawdbot';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Fetch schedule from database
    const { data: scheduleItems } = await supabaseAdmin
      .from('schedule_items')
      .select('*')
      .eq('enabled', true)
      .order('time', { ascending: true });

    const schedule = scheduleItems?.map(item => ({
      time: item.time.slice(0, 5), // "06:00:00" -> "06:00"
      task: item.task,
      type: item.type,
      status: item.status
    })) || [];

    // Fetch tasks from database
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .order('position', { ascending: true });

    // Fetch automated reminders from database
    const { data: reminders } = await supabaseAdmin
      .from('automated_reminders')
      .select('*')
      .eq('enabled', true)
      .order('position', { ascending: true });

    // Transform reminders to match CronJob interface
    const cronJobs = reminders?.map(reminder => ({
      id: reminder.id,
      name: reminder.title,
      schedule: `${reminder.time.slice(3, 5)} ${reminder.time.slice(0, 2)} * * *`, // "07:00" -> "00 07 * * *"
      timezone: 'Asia/Kolkata',
      action: {
        channel: reminder.channel,
        message: reminder.description,
        prompt: reminder.description
      }
    })) || [];

    const profile = getUserProfile();

    return NextResponse.json({
      tasks: tasks || [],
      cronJobs,
      schedule,
      profile,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

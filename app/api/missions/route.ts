import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: missions, error } = await supabaseAdmin
      .from('missions')
      .select('id, title, icon, progress, deadline, current_value, target_value, unit, status, key_actions')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching missions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch missions' },
        { status: 500 }
      );
    }

    // Ensure proper data formatting
    const transformedMissions = missions?.map(m => ({
      ...m,
      deadline: m.deadline, // Supabase returns DATE as 'YYYY-MM-DD' string
      key_actions: m.key_actions || []
    }));

    return NextResponse.json(transformedMissions || []);
  } catch (error) {
    console.error('Error in missions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, progress, key_actions, current_value, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Mission ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (progress !== undefined) updateData.progress = progress;
    if (key_actions !== undefined) updateData.key_actions = key_actions;
    if (current_value !== undefined) updateData.current_value = current_value;
    if (status !== undefined) updateData.status = status;

    const { data: mission, error } = await supabaseAdmin
      .from('missions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating mission:', error);
      return NextResponse.json(
        { error: 'Failed to update mission' },
        { status: 500 }
      );
    }

    return NextResponse.json(mission);
  } catch (error) {
    console.error('Error in missions PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

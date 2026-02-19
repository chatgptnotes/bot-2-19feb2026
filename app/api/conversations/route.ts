import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (conversationId) {
      // Fetch single conversation with its transcript entries
      const { data: conversation, error: convError } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (convError) {
        console.error('Error fetching conversation:', convError);
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }

      const { data: entries, error: entriesError } = await supabaseAdmin
        .from('transcript_entries')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (entriesError) {
        console.error('Error fetching transcript entries:', entriesError);
        return NextResponse.json(
          { error: 'Failed to fetch transcript entries' },
          { status: 500 }
        );
      }

      return NextResponse.json({ conversation, entries: entries || [] });
    }

    // Fetch all conversations
    const { data: conversations, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ conversations: conversations || [] });
  } catch (error) {
    console.error('Error in conversations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // Query transcript from Supabase
    const { data, error } = await supabaseAdmin
      .from('zoom_transcripts')
      .select('transcript_text')
      .eq('filename', filename)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ content: data.transcript_text });
  } catch (error) {
    return errorResponse('Failed to read transcript', error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // Delete transcript from Supabase
    const { error } = await supabaseAdmin
      .from('zoom_transcripts')
      .delete()
      .eq('filename', filename);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse('Failed to delete transcript', error);
  }
}

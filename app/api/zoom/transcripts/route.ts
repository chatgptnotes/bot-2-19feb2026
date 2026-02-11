import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { formatDuration, errorResponse } from '@/lib/utils';

export async function GET() {
  try {
    // Query all transcripts from Supabase
    const { data: transcripts, error } = await supabaseAdmin
      .from('zoom_transcripts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map database columns to frontend-expected format
    const formattedTranscripts = (transcripts || []).map((transcript) => {
      let duration = 'Unknown';

      // Try to get duration from duration_seconds column
      if (transcript.duration_seconds) {
        duration = formatDuration(transcript.duration_seconds);
      } else if (transcript.metadata?.duration) {
        // Fallback to metadata.duration
        duration = formatDuration(Math.floor(transcript.metadata.duration));
      }

      return {
        filename: transcript.filename,
        date: transcript.created_at,
        duration,
        wordCount: transcript.word_count || 0,
        size: transcript.file_size ? `${(transcript.file_size / 1024).toFixed(1)} KB` : 'Unknown',
        hasJson: transcript.metadata !== null,
        hasSrt: transcript.srt_content !== null && transcript.srt_content.length > 0,
      };
    });

    return NextResponse.json({ transcripts: formattedTranscripts });
  } catch (error) {
    return errorResponse('Failed to list transcripts', error);
  }
}

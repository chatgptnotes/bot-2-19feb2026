import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { errorResponse } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'txt';
    const filename = params.filename;

    // Query transcript from Supabase
    const { data, error } = await supabaseAdmin
      .from('zoom_transcripts')
      .select('transcript_text, metadata, srt_content')
      .eq('filename', filename)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Transcript not found' }, { status: 404 });
      }
      throw error;
    }

    let content: string;
    let contentType: string;
    let downloadName: string;

    switch (type) {
      case 'json':
        if (!data.metadata) {
          return NextResponse.json({ error: 'JSON metadata not available' }, { status: 404 });
        }
        content = JSON.stringify(data.metadata, null, 2);
        contentType = 'application/json';
        downloadName = filename.replace('.txt', '.json');
        break;

      case 'srt':
        if (!data.srt_content) {
          return NextResponse.json({ error: 'SRT content not available' }, { status: 404 });
        }
        content = data.srt_content;
        contentType = 'text/plain';
        downloadName = filename.replace('.txt', '.srt');
        break;

      default:
        content = data.transcript_text;
        contentType = 'text/plain';
        downloadName = filename;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${downloadName}"`,
      },
    });
  } catch (error) {
    return errorResponse('Failed to download file', error);
  }
}

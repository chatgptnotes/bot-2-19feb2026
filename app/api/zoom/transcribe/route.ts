import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, stat, readdir } from 'fs/promises';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import { supabaseAdmin } from '@/lib/supabase';
import { MAX_BUFFER_SIZE } from '@/lib/utils';

const execAsync = promisify(exec);

const UPLOAD_DIR = path.join(os.tmpdir(), 'zoom-uploads');
const TRANSCRIPTS_DIR = path.join(os.homedir(), '.openclaw', 'workspace', 'transcripts');
const TRANSCRIBE_SCRIPT = path.join(os.homedir(), '.openclaw', 'workspace', 'skills', 'zoom-transcription', 'transcribe-zoom.sh');

export async function POST(request: NextRequest) {
  let transcriptFilename: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['video/', 'audio/'];
    if (!validTypes.some(type => file.type.startsWith(type))) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a video or audio file.' },
        { status: 400 }
      );
    }

    // Create upload directory
    const { mkdir } = await import('fs/promises');
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Save uploaded file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name);
    const uploadPath = path.join(UPLOAD_DIR, `upload_${Date.now()}${ext}`);
    await writeFile(uploadPath, buffer);

    // Get OpenAI API key from openclaw config
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    let apiKey = process.env.OPENAI_API_KEY;

    try {
      const configContent = await readFile(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      if (config.env?.OPENAI_API_KEY) {
        apiKey = config.env.OPENAI_API_KEY;
      }
    } catch {
      // Use env variable as fallback
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in ~/.openclaw/openclaw.json' },
        { status: 500 }
      );
    }

    // Run transcription script (this writes to TRANSCRIPTS_DIR)
    const env = {
      ...process.env,
      OPENAI_API_KEY: apiKey,
    };

    const { stdout } = await execAsync(
      `"${TRANSCRIBE_SCRIPT}" "${uploadPath}"`,
      {
        env,
        maxBuffer: MAX_BUFFER_SIZE,
      }
    );

    // Find the newly created transcript files
    // The script creates zoom_YYYYMMDD_HHMMSS.txt files
    const files = await readdir(TRANSCRIPTS_DIR);
    const txtFiles = files.filter(f => f.endsWith('.txt') && !f.endsWith('.txt.json') && !f.endsWith('.txt.srt'));

    // Get the most recently created transcript (should be the one we just made)
    let latestFile = null;
    let latestTime = 0;

    for (const file of txtFiles) {
      const filePath = path.join(TRANSCRIPTS_DIR, file);
      const stats = await stat(filePath);
      if (stats.mtimeMs > latestTime) {
        latestTime = stats.mtimeMs;
        latestFile = file;
      }
    }

    if (!latestFile) {
      throw new Error('Transcription completed but no transcript file found');
    }

    transcriptFilename = latestFile;

    // Read transcript content
    const transcriptPath = path.join(TRANSCRIPTS_DIR, latestFile);
    const transcriptText = await readFile(transcriptPath, 'utf-8');
    const wordCount = transcriptText.trim().split(/\s+/).length;
    const fileStats = await stat(transcriptPath);

    // Read metadata JSON if exists
    let metadata = null;
    let durationSeconds = null;
    const jsonPath = path.join(TRANSCRIPTS_DIR, `${latestFile}.json`);
    try {
      const jsonContent = await readFile(jsonPath, 'utf-8');
      metadata = JSON.parse(jsonContent);
      if (metadata.duration) {
        durationSeconds = Math.floor(metadata.duration);
      }
    } catch {
      // No metadata file found
    }

    // Read SRT content if exists
    let srtContent = null;
    const srtPath = path.join(TRANSCRIPTS_DIR, `${latestFile}.srt`);
    try {
      srtContent = await readFile(srtPath, 'utf-8');
    } catch {
      // No SRT file found
    }

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('zoom_transcripts')
      .insert({
        filename: latestFile,
        transcript_text: transcriptText,
        metadata: metadata,
        srt_content: srtContent,
        word_count: wordCount,
        duration_seconds: durationSeconds,
        file_size: fileStats.size,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save transcript to database: ${error.message}`);
    }

    // Clean up temporary files
    try {
      await unlink(uploadPath);
      await unlink(transcriptPath);
      if (metadata) await unlink(jsonPath);
      if (srtContent) await unlink(srtPath);
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json({
      success: true,
      message: 'Transcription completed and saved to database',
      transcriptId: data.id,
    });
  } catch (error: unknown) {
    // If we failed after creating the transcript, clean up the files
    if (transcriptFilename) {
      try {
        const transcriptPath = path.join(TRANSCRIPTS_DIR, transcriptFilename);
        await unlink(transcriptPath).catch(() => {});
        await unlink(`${transcriptPath}.json`).catch(() => {});
        await unlink(`${transcriptPath}.srt`).catch(() => {});
      } catch {
        // Ignore cleanup errors
      }
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Transcription failed',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

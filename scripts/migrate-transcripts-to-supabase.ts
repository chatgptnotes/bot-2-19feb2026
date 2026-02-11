#!/usr/bin/env ts-node

/**
 * Migration script to move existing transcripts from filesystem to Supabase
 *
 * Usage: npx ts-node scripts/migrate-transcripts-to-supabase.ts
 */

import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';
import os from 'os';
import { createClient } from '@supabase/supabase-js';

const TRANSCRIPTS_DIR = path.join(os.homedir(), '.openclaw', 'workspace', 'transcripts');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
async function loadEnv() {
  try {
    const envContent = await readFile(envPath, 'utf-8');
    const lines = envContent.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').replace(/^["']|["']$/g, '');
        process.env[key] = value;
      }
    }
  } catch (error) {
    console.error('Failed to load .env.local:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting transcript migration to Supabase...\n');

  // Load environment variables
  await loadEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('✅ Connected to Supabase\n');
  console.log(`📁 Reading transcripts from: ${TRANSCRIPTS_DIR}\n`);

  try {
    // Read all files in transcripts directory
    const files = await readdir(TRANSCRIPTS_DIR);
    const txtFiles = files.filter(f =>
      f.endsWith('.txt') &&
      !f.endsWith('.txt.json') &&
      !f.endsWith('.txt.srt')
    );

    if (txtFiles.length === 0) {
      console.log('ℹ️  No transcripts found to migrate');
      return;
    }

    console.log(`📊 Found ${txtFiles.length} transcript(s) to migrate\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const filename of txtFiles) {
      try {
        console.log(`🔄 Processing: ${filename}`);

        // Check if already exists in database
        const { data: existing } = await supabase
          .from('zoom_transcripts')
          .select('id')
          .eq('filename', filename)
          .single();

        if (existing) {
          console.log(`   ⏭️  Already exists in database, skipping\n`);
          skipCount++;
          continue;
        }

        // Read transcript text
        const transcriptPath = path.join(TRANSCRIPTS_DIR, filename);
        const transcriptText = await readFile(transcriptPath, 'utf-8');
        const fileStats = await stat(transcriptPath);

        // Count words
        const wordCount = transcriptText.trim().split(/\s+/).length;

        // Read metadata JSON if exists
        let metadata = null;
        let durationSeconds = null;
        const jsonPath = path.join(TRANSCRIPTS_DIR, `${filename}.json`);
        try {
          const jsonContent = await readFile(jsonPath, 'utf-8');
          metadata = JSON.parse(jsonContent);
          if (metadata.duration) {
            durationSeconds = Math.floor(metadata.duration);
          }
          console.log(`   ✓ Loaded JSON metadata`);
        } catch (e) {
          console.log(`   - No JSON metadata`);
        }

        // Read SRT content if exists
        let srtContent = null;
        const srtPath = path.join(TRANSCRIPTS_DIR, `${filename}.srt`);
        try {
          srtContent = await readFile(srtPath, 'utf-8');
          console.log(`   ✓ Loaded SRT content`);
        } catch (e) {
          console.log(`   - No SRT file`);
        }

        // Insert into Supabase
        const { error } = await supabase
          .from('zoom_transcripts')
          .insert({
            filename,
            transcript_text: transcriptText,
            metadata,
            srt_content: srtContent,
            word_count: wordCount,
            duration_seconds: durationSeconds,
            file_size: fileStats.size,
          });

        if (error) {
          console.error(`   ❌ Failed: ${error.message}\n`);
          errorCount++;
        } else {
          console.log(`   ✅ Successfully migrated (${wordCount} words)\n`);
          successCount++;
        }
      } catch (error: any) {
        console.error(`   ❌ Error processing ${filename}:`, error.message, '\n');
        errorCount++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (successCount > 0) {
      console.log('✨ Migration completed successfully!');
      console.log('ℹ️  Original files have NOT been deleted (kept as backup)');
    }

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);

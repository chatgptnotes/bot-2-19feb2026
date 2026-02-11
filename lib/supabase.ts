import { createClient } from '@supabase/supabase-js';

// Browser client (uses anon key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Server-side admin client (uses service role key)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// TypeScript interfaces for transcript data
export interface ZoomTranscript {
  id: string;
  filename: string;
  transcript_text: string;
  metadata: TranscriptMetadata | null;
  srt_content: string | null;
  created_at: string;
  updated_at: string;
  word_count: number | null;
  duration_seconds: number | null;
  file_size: number | null;
}

export interface TranscriptMetadata {
  duration?: number;
  language?: string;
  model?: string;
  [key: string]: any;
}

export interface TranscriptListItem {
  filename: string;
  date: string;
  duration: string;
  wordCount: number;
  size: string;
  hasJson: boolean;
  hasSrt: boolean;
}

// Database type definitions
export type Database = {
  public: {
    Tables: {
      zoom_transcripts: {
        Row: ZoomTranscript;
        Insert: Omit<ZoomTranscript, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ZoomTranscript, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};

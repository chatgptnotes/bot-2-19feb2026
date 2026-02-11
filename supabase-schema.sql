-- Zoom Transcripts Table Schema
-- Run this SQL in Supabase SQL Editor: https://dwxincictrvyyshuhilq.supabase.co

-- Create zoom_transcripts table
CREATE TABLE IF NOT EXISTS zoom_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename VARCHAR(255) NOT NULL UNIQUE,
  transcript_text TEXT NOT NULL,
  metadata JSONB,
  srt_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  word_count INTEGER,
  duration_seconds INTEGER,
  file_size INTEGER
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transcripts_created_at ON zoom_transcripts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcripts_filename ON zoom_transcripts(filename);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_zoom_transcripts_updated_at BEFORE UPDATE
    ON zoom_transcripts FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE zoom_transcripts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for service role
CREATE POLICY "Enable all operations for service role"
ON zoom_transcripts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow read access for anon users (for now - adjust as needed)
CREATE POLICY "Enable read access for anon users"
ON zoom_transcripts
FOR SELECT
TO anon
USING (true);

-- Verify table creation
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_name = 'zoom_transcripts'
ORDER BY
    ordinal_position;

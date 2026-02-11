# Zoom Transcript Migration to Supabase - Setup Guide

## 🎯 Overview
Your OpenClaw Dashboard now stores Zoom transcripts in Supabase instead of local files. This enables cloud storage and multi-device access.

## ✅ Completed Implementation

All code changes are complete:
- ✅ Supabase client installed (`@supabase/supabase-js`)
- ✅ Environment variables configured in `.env.local`
- ✅ Supabase client utility created (`lib/supabase.ts`)
- ✅ All 4 API routes updated to use Supabase
- ✅ Migration script created for existing transcripts

## 📋 Next Steps (Required)

### Step 1: Create Database Schema in Supabase

1. **Open Supabase Dashboard:**
   - Go to: https://dwxincictrvyyshuhilq.supabase.co
   - Login to your account

2. **Navigate to SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Schema SQL:**
   - Open the file: `supabase-schema.sql` (in the project root)
   - Copy ALL the SQL content
   - Paste into the Supabase SQL Editor
   - Click "Run" button (or press Cmd+Enter)

4. **Verify Table Creation:**
   - Go to "Table Editor" in left sidebar
   - You should see `zoom_transcripts` table
   - Click on it to verify columns exist:
     - id, filename, transcript_text, metadata, srt_content
     - created_at, updated_at, word_count, duration_seconds, file_size

### Step 2: Migrate Existing Transcripts

You have 2 existing transcripts that need to be migrated to the database:
- `zoom_20260208_214752.txt` (5 bytes - test file)
- `zoom_20260208_215254.txt` (11 KB - full meeting)

**Run the migration script:**

```bash
cd /Users/murali/1backup/Bot
npx ts-node scripts/migrate-transcripts-to-supabase.ts
```

**Expected Output:**
```
🚀 Starting transcript migration to Supabase...
✅ Connected to Supabase
📁 Reading transcripts from: /Users/murali/.openclaw/workspace/transcripts/
📊 Found 2 transcript(s) to migrate

🔄 Processing: zoom_20260208_214752.txt
   ✓ Loaded JSON metadata
   - No SRT file
   ✅ Successfully migrated (1 words)

🔄 Processing: zoom_20260208_215254.txt
   ✓ Loaded JSON metadata
   ✓ Loaded SRT content
   ✅ Successfully migrated (2431 words)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 Migration Summary:
   ✅ Successfully migrated: 2
   ⏭️  Skipped (already exists): 0
   ❌ Failed: 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Migration completed successfully!
ℹ️  Original files have NOT been deleted (kept as backup)
```

**Note:** Original files remain in `~/.openclaw/workspace/transcripts/` as backup.

### Step 3: Test the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the dashboard:**
   ```
   http://localhost:3001
   ```

3. **Scroll to "Zoom Meetings" section**

4. **Verify existing transcripts appear:**
   - You should see your 2 migrated transcripts
   - Click "View" to see content
   - Click "Download TXT/JSON/SRT" to test downloads

5. **Test Upload & Transcribe:**
   - Click "Upload & Transcribe" button
   - Select a small audio/video file
   - Wait for transcription to complete
   - New transcript should appear in the list
   - Check Supabase dashboard to verify row inserted

6. **Test Delete:**
   - Click "Delete" on a test transcript
   - It should remove from list
   - Check Supabase dashboard to verify deletion

## 🔍 Verification Checklist

After completing all steps, verify:

- [ ] Supabase table `zoom_transcripts` exists
- [ ] Migration script ran successfully (2 transcripts migrated)
- [ ] Dashboard shows existing transcripts
- [ ] Can view transcript content
- [ ] Can download TXT, JSON, SRT files
- [ ] Can delete transcripts
- [ ] Can upload new files and transcribe
- [ ] Search and filter work correctly

## 🚨 Troubleshooting

### Issue: "Failed to list transcripts"
**Solution:**
- Verify Supabase credentials in `.env.local` are correct
- Check table exists in Supabase dashboard
- Check browser console for errors

### Issue: "Transcript not found" when viewing
**Solution:**
- Run migration script if you haven't already
- Verify transcripts exist in Supabase (Table Editor)

### Issue: Migration script fails
**Solution:**
- Ensure `.env.local` has correct Supabase credentials
- Verify table schema was created in Step 1
- Check you have `ts-node` installed: `npm install -g ts-node`

### Issue: TypeScript errors
**Solution:**
```bash
npm install --legacy-peer-deps
```

## 📊 Database Schema

**Table:** `zoom_transcripts`
```sql
id               UUID (primary key)
filename         VARCHAR(255) UNIQUE
transcript_text  TEXT
metadata         JSONB (nullable)
srt_content      TEXT (nullable)
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
word_count       INTEGER (nullable)
duration_seconds INTEGER (nullable)
file_size        INTEGER (nullable)
```

**Indexes:**
- `idx_transcripts_created_at` - For fast sorting
- `idx_transcripts_filename` - For quick lookups

**Row Level Security (RLS):**
- Service role has full access
- Anon users have read-only access

## 🎉 Success!

Once all verification steps pass, your Zoom transcript storage is fully migrated to Supabase!

**Benefits:**
- ☁️ Cloud storage (accessible from anywhere)
- 🔄 No more local file management
- 📈 Scalable database storage
- 🔍 Better query capabilities
- 🔐 Secure with Row Level Security
- 🚀 Ready for multi-user support

## 📝 Notes

- Original transcript files in `~/.openclaw/workspace/transcripts/` are kept as backup
- You can delete them manually once you've verified everything works
- Future transcripts will be stored directly in Supabase
- The transcription workflow (OpenAI Whisper) remains unchanged

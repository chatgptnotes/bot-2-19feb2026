import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Types
interface ReplyLogEntry {
  threadId: string;
  from: string;
  subject: string;
  aiReply: string;
  timestamp: string;
}

type TonePreset = 'professional' | 'friendly' | 'formal' | 'hindi' | 'hinglish';

// Track replied thread IDs (in-memory backup, primary check is messageCount)
const repliedThreadIds = new Set<string>();

// In-memory reply log
const replyLog: ReplyLogEntry[] = [];

// Auto-reply config (module-level state)
let autoReplyConfig = {
  enabled: false,
  subjectFilter: 'test',
  account: 'chatgptnotes@gmail.com',
  tone: 'professional' as TonePreset,
  customInstructions: '',
};

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

const gogEnv = {
  ...process.env,
  PATH: '/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '/usr/bin:/bin'),
};

// Tone-specific instructions for Gemini
const toneInstructions: Record<TonePreset, string> = {
  professional: 'Write a professional, concise reply. Be polite and to the point.',
  friendly: 'Write a warm, friendly reply. Be casual but helpful. Use a conversational tone.',
  formal: 'Write a very formal reply. Use proper salutations and formal language throughout.',
  hindi: 'Reply entirely in Hindi (Devanagari script). Be polite and helpful.',
  hinglish: 'Reply in Hinglish (mix of Hindi and English, Roman script). Be friendly and natural.',
};

// Generate smart reply using Gemini AI
async function generateSmartReply(
  from: string,
  subject: string,
  body: string,
  tone: TonePreset,
  customInstructions: string
): Promise<string> {
  const toneText = toneInstructions[tone] || toneInstructions.professional;
  const customPart = customInstructions
    ? `\n\nAdditional instructions from the user:\n${customInstructions}`
    : '';

  const prompt = `You are an email auto-reply assistant for Murali (chatgptnotes@gmail.com).

Read this email and write a reply. ${toneText}
Keep it under 3-4 sentences. Don't use any markdown formatting - plain text only.${customPart}

From: ${from}
Subject: ${subject}
Body:
${body}

Write ONLY the reply text, nothing else.`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No reply generated');
  return text.trim();
}

// GET: Poll Gmail and auto-reply to matching unread emails
export async function GET() {
  try {
    if (!autoReplyConfig.enabled) {
      return NextResponse.json({ enabled: false, message: 'Auto-reply is disabled', replyLog });
    }

    const filter = autoReplyConfig.subjectFilter;
    const account = autoReplyConfig.account;

    // Search for unread emails matching subject filter (only inbox)
    const searchCmd = `gog gmail search "subject:${filter} is:unread in:inbox" --max 5 -j --account ${account}`;
    const { stdout: searchOut } = await execAsync(searchCmd, { timeout: 30000, env: gogEnv });

    const searchResult = JSON.parse(searchOut);
    const threads = searchResult.threads || [];

    if (threads.length === 0) {
      return NextResponse.json({ enabled: true, found: 0, replied: 0, message: 'No matching unread emails', replyLog });
    }

    const results: any[] = [];

    for (const thread of threads) {
      const threadId = thread.id;

      // PRIMARY CHECK: Skip threads that already have a reply (messageCount > 1)
      // This survives server restarts since it's based on Gmail state
      if (thread.messageCount > 1) continue;

      // SECONDARY CHECK: In-memory backup
      if (repliedThreadIds.has(threadId)) continue;

      // Skip emails from ourselves
      if (thread.from?.includes(account)) continue;

      try {
        // Step 1: READ the email content first
        const getCmd = `gog gmail get "${threadId}" -j --account ${account}`;
        const { stdout: msgOut } = await execAsync(getCmd, { timeout: 15000, env: gogEnv });
        const msgData = JSON.parse(msgOut);

        const from = msgData.headers?.from || thread.from || 'Unknown';
        const subject = msgData.headers?.subject || thread.subject || 'No subject';
        const emailBody = msgData.body || '(no body)';

        // Step 2: Generate smart AI reply based on email content
        const aiReply = await generateSmartReply(
          from, subject, emailBody,
          autoReplyConfig.tone,
          autoReplyConfig.customInstructions
        );

        // Step 3: Send the reply
        const reSubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
        const escapedSubject = reSubject.replace(/'/g, "'\\''");
        const escapedBody = aiReply.replace(/'/g, "'\\''");
        const replyCmd = `gog gmail send --reply-to-message-id '${threadId}' --reply-all --subject '${escapedSubject}' --body '${escapedBody}' --account ${account} --force`;
        await execAsync(replyCmd, { timeout: 30000, env: gogEnv });

        // Track as replied
        repliedThreadIds.add(threadId);

        // Log the reply
        replyLog.push({
          threadId,
          from,
          subject,
          aiReply,
          timestamp: new Date().toISOString(),
        });

        results.push({
          threadId,
          from,
          subject,
          aiReply,
          status: 'replied',
        });
      } catch (err: any) {
        results.push({
          threadId,
          from: thread.from,
          status: 'failed',
          error: err.stderr || err.message,
        });
      }
    }

    return NextResponse.json({
      enabled: true,
      found: threads.length,
      replied: results.filter(r => r.status === 'replied').length,
      results,
      replyLog,
    });
  } catch (error: any) {
    console.error('Auto-reply error:', error);
    return NextResponse.json(
      { error: 'Auto-reply check failed', details: error.stderr || error.message },
      { status: 500 }
    );
  }
}

// POST: Configure auto-reply settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.enabled !== undefined) autoReplyConfig.enabled = body.enabled;
    if (body.subjectFilter) autoReplyConfig.subjectFilter = body.subjectFilter;
    if (body.tone) autoReplyConfig.tone = body.tone;
    if (body.customInstructions !== undefined) autoReplyConfig.customInstructions = body.customInstructions;

    // If disabling, clear the replied set and reply log so re-enabling starts fresh
    if (body.enabled === false) {
      repliedThreadIds.clear();
      replyLog.length = 0;
    }

    return NextResponse.json({
      success: true,
      config: {
        enabled: autoReplyConfig.enabled,
        subjectFilter: autoReplyConfig.subjectFilter,
        account: autoReplyConfig.account,
        tone: autoReplyConfig.tone,
        customInstructions: autoReplyConfig.customInstructions,
      },
      replyLog,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update config', details: error.message },
      { status: 500 }
    );
  }
}

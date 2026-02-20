import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const gogEnv = {
  ...process.env,
  PATH: '/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '/usr/bin:/bin'),
};

const account = 'chatgptnotes@gmail.com';
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

type TonePreset = 'professional' | 'friendly' | 'formal' | 'hindi' | 'hinglish';

const toneInstructions: Record<TonePreset, string> = {
  professional: 'Write a professional, concise reply. Be polite and to the point.',
  friendly: 'Write a warm, friendly reply. Be casual but helpful. Use a conversational tone.',
  formal: 'Write a very formal reply. Use proper salutations and formal language throughout.',
  hindi: 'Reply entirely in Hindi (Devanagari script). Be polite and helpful.',
  hinglish: 'Reply in Hinglish (mix of Hindi and English, Roman script). Be friendly and natural.',
};

// POST: Generate AI reply or send reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, threadId, tone, replyBody, subject } = body;

    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
    }

    // Action: generate - Generate AI reply text
    if (action === 'generate') {
      // First read the email content
      const getCmd = `gog gmail get "${threadId}" -j --account ${account}`;
      const { stdout } = await execAsync(getCmd, { timeout: 15000, env: gogEnv });
      const msgData = JSON.parse(stdout);

      const from = msgData.headers?.from || 'Unknown';
      const emailSubject = msgData.headers?.subject || 'No subject';
      const emailBody = msgData.body || '(no body)';
      const toneKey = (tone || 'professional') as TonePreset;
      const toneText = toneInstructions[toneKey] || toneInstructions.professional;

      const prompt = `You are an email auto-reply assistant for Murali (chatgptnotes@gmail.com).

Read this email and write a reply. ${toneText}
Keep it under 3-4 sentences. Don't use any markdown formatting - plain text only.

From: ${from}
Subject: ${emailSubject}
Body:
${emailBody}

Write ONLY the reply text, nothing else.`;

      const geminiRes = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      });

      if (!geminiRes.ok) {
        throw new Error(`Gemini API error: ${geminiRes.status}`);
      }

      const geminiData = await geminiRes.json();
      const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!replyText) throw new Error('No reply generated');

      return NextResponse.json({
        success: true,
        generatedReply: replyText.trim(),
        subject: emailSubject,
      });
    }

    // Action: send - Send the reply
    if (action === 'send') {
      if (!replyBody) {
        return NextResponse.json({ error: 'replyBody is required' }, { status: 400 });
      }

      const reSubject = subject?.startsWith('Re:') ? subject : `Re: ${subject || ''}`;
      const escapedSubject = reSubject.replace(/'/g, "'\\''");
      const escapedBody = replyBody.replace(/'/g, "'\\''");

      const sendCmd = `gog gmail send --reply-to-message-id '${threadId}' --reply-all --subject '${escapedSubject}' --body '${escapedBody}' --account ${account} --force`;
      await execAsync(sendCmd, { timeout: 30000, env: gogEnv });

      return NextResponse.json({ success: true, message: 'Reply sent!' });
    }

    return NextResponse.json({ error: 'Invalid action. Use "generate" or "send"' }, { status: 400 });
  } catch (error: any) {
    console.error('Reply error:', error);
    return NextResponse.json(
      { error: 'Reply failed', details: error.stderr || error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const account = 'chatgptnotes@gmail.com';
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const gogEnv = {
  ...process.env,
  PATH: '/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '/usr/bin:/bin'),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, to, cc, subject, emailBody } = body;

    if (!to) {
      return NextResponse.json({ error: 'Recipient (to) is required' }, { status: 400 });
    }

    // Action: ai-draft - Generate email body via Gemini
    if (action === 'ai-draft') {
      if (!subject) {
        return NextResponse.json({ error: 'Subject is required for AI draft' }, { status: 400 });
      }

      const prompt = `You are an email assistant for Dr. Murali BK (chatgptnotes@gmail.com).
Write a professional email body for the following:

To: ${to}
Subject: ${subject}
${emailBody ? `Context/notes: ${emailBody}` : ''}

Write ONLY the email body text. Don't include subject line or greetings headers. Keep it concise and professional. Plain text only, no markdown.`;

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API error (${res.status}): ${errText}`);
      }

      const data = await res.json();
      const generatedBody = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedBody) throw new Error('No draft generated');

      return NextResponse.json({ success: true, generatedBody: generatedBody.trim() });
    }

    // Default action: send email
    if (!subject) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }
    if (!emailBody) {
      return NextResponse.json({ error: 'Email body is required' }, { status: 400 });
    }

    const escapedTo = to.replace(/'/g, "'\\''");
    const escapedSubject = subject.replace(/'/g, "'\\''");
    const escapedBody = emailBody.replace(/'/g, "'\\''");

    let sendCmd = `gog gmail send --to '${escapedTo}' --subject '${escapedSubject}' --body '${escapedBody}' --account ${account} --force`;

    if (cc) {
      const escapedCc = cc.replace(/'/g, "'\\''");
      sendCmd = `gog gmail send --to '${escapedTo}' --cc '${escapedCc}' --subject '${escapedSubject}' --body '${escapedBody}' --account ${account} --force`;
    }

    await execAsync(sendCmd, { timeout: 30000, env: gogEnv });

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (error: any) {
    console.error('Compose error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.stderr || error.message },
      { status: 500 }
    );
  }
}

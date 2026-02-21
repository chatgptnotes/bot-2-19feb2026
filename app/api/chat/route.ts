import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const defaultTo = process.env.WHATSAPP_DEFAULT_NUMBER || '+919373111709';
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;

// Pass OpenClaw env vars to child processes
const openclawEnv = {
  ...process.env,
  OPENCLAW_HOST: process.env.OPENCLAW_HOST || 'https://hopetech.me/openclaw',
  OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || '',
  OPENCLAW_HOOK_TOKEN: process.env.OPENCLAW_HOOK_TOKEN || '',
  PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
};

const IMAGE_SYSTEM_INSTRUCTION = 'You are a helpful AI assistant. Analyze the image thoroughly and answer in the same language the user uses (Hindi, Hinglish, or English).';

// Direct Gemini API call for image messages (OpenClaw CLI doesn't support images)
async function callGeminiWithImage(
  message: string,
  imageBase64: string,
  imageMimeType: string
): Promise<string> {
  const parts: any[] = [];
  parts.push({ text: message || 'Describe this image in detail' });
  parts.push({
    inlineData: {
      mimeType: imageMimeType,
      data: imageBase64,
    },
  });

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: IMAGE_SYSTEM_INSTRUCTION }] },
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');
  return text;
}

// OpenClaw Gateway agent call for text messages (has tools: web search, browser, memory, etc.)
async function callOpenClawAgent(message: string, sessionId: string): Promise<string> {
  const escapedMessage = message.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const command = `openclaw agent -m "${escapedMessage}" --session-id "${sessionId}" --json`;

  const { stdout } = await execAsync(command, { timeout: 120000, env: openclawEnv });

  const result = JSON.parse(stdout);
  const reply = result.result?.payloads?.[0]?.text
    || result.reply || result.message || result.text || result.output
    || stdout.trim();
  return reply;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, mode, image, imageMimeType } = body;

    if (!message && !image) {
      return NextResponse.json({ error: 'Message or image is required' }, { status: 400 });
    }

    if (mode === 'ai') {
      let reply: string;

      if (image && imageMimeType) {
        // Image messages → Gemini API directly (OpenClaw CLI doesn't support images)
        reply = await callGeminiWithImage(message || '', image, imageMimeType);
      } else {
        // Text messages → OpenClaw Gateway agent (has tools + session memory)
        reply = await callOpenClawAgent(message, 'clawdbot-main');
      }

      return NextResponse.json({ success: true, mode: 'ai', reply });
    } else {
      // WhatsApp mode - send message via OpenClaw
      const to = body.to || defaultTo;
      const escapedMessage = (message || '').replace(/"/g, '\\"');
      const command = `openclaw message send --channel whatsapp --target "${to}" --message "${escapedMessage}"`;

      const { stdout } = await execAsync(command, { env: openclawEnv });

      return NextResponse.json({
        success: true,
        mode: 'whatsapp',
        reply: `Message sent to ${to}`,
        output: stdout.trim(),
      });
    }
  } catch (error: any) {
    console.error('Chat error:', error);
    const stderr = error.stderr || error.message || '';
    let userMessage = 'Failed to process message';
    if (error.code === 'ENOENT' || stderr.includes('not found')) {
      userMessage = 'OpenClaw CLI is not available on this server';
    } else if (stderr.includes('No active WhatsApp') || stderr.includes('not linked')) {
      userMessage = 'WhatsApp is not connected. Run: openclaw channels login --channel whatsapp';
    } else if (stderr.includes('timeout') || error.killed) {
      userMessage = 'Request timed out. Try again.';
    } else if (stderr.includes('Gemini API error')) {
      userMessage = 'AI service error. Please try again.';
    }
    return NextResponse.json(
      { error: userMessage, details: stderr },
      { status: 500 }
    );
  }
}

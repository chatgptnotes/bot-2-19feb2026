import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const defaultTo = process.env.WHATSAPP_DEFAULT_NUMBER || '+919373111709';
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Pass OpenClaw env vars to child processes
const openclawEnv = {
  ...process.env,
  OPENCLAW_HOST: process.env.OPENCLAW_HOST || 'http://192.168.1.13',
  OPENCLAW_PORT: process.env.OPENCLAW_PORT || '18789',
  OPENCLAW_GATEWAY_TOKEN: process.env.OPENCLAW_GATEWAY_TOKEN || '',
  OPENCLAW_HOOK_TOKEN: process.env.OPENCLAW_HOOK_TOKEN || '',
  PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
};

const SYSTEM_INSTRUCTION = 'You are a helpful general-purpose AI assistant on the ClawdBot Dashboard. Answer directly and concisely in the same language the user uses (Hindi, Hinglish, or English). Do NOT talk about Chrome extensions, browser sessions, email access, pairing, or your own setup. Do NOT ask for the user\'s name or try to update any files. Just answer what is asked. If an image is provided, analyze it thoroughly.';

interface HistoryMessage {
  role: 'user' | 'assistant';
  text: string;
}

async function callGemini(
  message: string,
  history: HistoryMessage[] = [],
  imageBase64?: string,
  imageMimeType?: string
): Promise<string> {
  // Build multi-turn contents array from history
  const contents: any[] = [];

  for (const msg of history) {
    if (!msg.text || msg.text === '(image)') continue;
    // Skip error messages
    if (msg.role === 'assistant' && msg.text.startsWith('Error:')) continue;
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }],
    });
  }

  // Add current user message as the final turn
  const currentParts: any[] = [];
  if (message) {
    currentParts.push({ text: message });
  }
  if (imageBase64 && imageMimeType) {
    currentParts.push({
      inlineData: {
        mimeType: imageMimeType,
        data: imageBase64,
      },
    });
    if (!message) {
      currentParts.unshift({ text: 'Describe this image' });
    }
  }
  contents.push({ role: 'user', parts: currentParts });

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No response from Gemini');
  }
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, mode, image, imageMimeType, history } = body;

    if (!message && !image) {
      return NextResponse.json({ error: 'Message or image is required' }, { status: 400 });
    }

    if (mode === 'ai') {
      // Use Gemini API with full conversation history
      const reply = await callGemini(
        message || '',
        history || [],
        image,
        imageMimeType
      );
      return NextResponse.json({
        success: true,
        mode: 'ai',
        reply,
      });
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

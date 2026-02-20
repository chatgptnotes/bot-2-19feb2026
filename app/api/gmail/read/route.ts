import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const gogEnv = {
  ...process.env,
  PATH: '/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '/usr/bin:/bin'),
};

const account = 'chatgptnotes@gmail.com';

// GET: Fetch single email content by threadId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json({ error: 'threadId is required' }, { status: 400 });
    }

    const getCmd = `gog gmail get "${threadId}" -j --account ${account}`;
    const { stdout } = await execAsync(getCmd, { timeout: 15000, env: gogEnv });

    const msgData = JSON.parse(stdout);

    const body = msgData.body || '(no body)';
    const isHtml = body.trim().startsWith('<') || body.includes('<html') || body.includes('<body');

    const messageId = msgData.message?.id || threadId;

    const attachments = (msgData.attachments || []).map((att: any) => ({
      filename: att.filename || 'unknown',
      size: att.size || 0,
      sizeHuman: att.sizeHuman || '',
      mimeType: att.mimeType || 'application/octet-stream',
      attachmentId: att.attachmentId || '',
    }));

    return NextResponse.json({
      from: msgData.headers?.from || 'Unknown',
      subject: msgData.headers?.subject || '(no subject)',
      body,
      date: msgData.headers?.date || '',
      contentType: isHtml ? 'html' : 'text',
      messageId,
      attachments,
    });
  } catch (error: any) {
    console.error('Email read error:', error);
    return NextResponse.json(
      { error: 'Failed to read email', details: error.stderr || error.message },
      { status: 500 }
    );
  }
}

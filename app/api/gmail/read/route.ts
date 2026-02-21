import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const gogEnv = {
  ...process.env,
  PATH: '/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '/usr/bin:/bin'),
};

const account = 'chatgptnotes@gmail.com';

// Recursively search MIME parts for a specific content type
function findPart(parts: any[], mimeType: string): any | null {
  for (const p of parts) {
    if (p.mimeType === mimeType && p.body?.data) return p;
    if (p.parts?.length) {
      const found = findPart(p.parts, mimeType);
      if (found) return found;
    }
  }
  return null;
}

// Collect all parts with Content-ID headers (for CID image resolution)
function collectCidParts(parts: any[]): Array<{ cid: string; filename: string; attachmentId: string }> {
  const result: Array<{ cid: string; filename: string; attachmentId: string }> = [];
  for (const p of parts) {
    const headers = p.headers || [];
    const cidHeader = headers.find((h: any) => h.name.toLowerCase() === 'content-id');
    if (cidHeader) {
      const cid = cidHeader.value.replace(/[<>]/g, '');
      result.push({
        cid,
        filename: p.filename || cid,
        attachmentId: p.body?.attachmentId || '',
      });
    }
    if (p.parts?.length) {
      result.push(...collectCidParts(p.parts));
    }
  }
  return result;
}

// Recursively collect attachment parts from MIME structure
function collectAttachmentParts(parts: any[]): Array<{
  filename: string;
  size: number;
  mimeType: string;
  attachmentId: string;
}> {
  const result: Array<{ filename: string; size: number; mimeType: string; attachmentId: string }> = [];
  for (const p of parts) {
    if (p.filename && p.body?.attachmentId) {
      result.push({
        filename: p.filename,
        size: p.body.size || 0,
        mimeType: p.mimeType || 'application/octet-stream',
        attachmentId: p.body.attachmentId,
      });
    }
    if (p.parts?.length) {
      result.push(...collectAttachmentParts(p.parts));
    }
  }
  return result;
}

// Decode Gmail's URL-safe base64
function decodeBase64(data: string): string {
  const b64 = data.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(b64, 'base64').toString('utf-8');
}

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

    let body = msgData.body || '(no body)';
    let isHtml = false;

    const parts = msgData.message?.payload?.parts || [];

    // 1. Recursively search all nesting levels for text/html
    const htmlPart = findPart(parts, 'text/html');
    if (htmlPart?.body?.data) {
      body = decodeBase64(htmlPart.body.data);
      isHtml = true;
    } else {
      // 2. Check payload body directly (single-part messages)
      const payloadBody = msgData.message?.payload?.body;
      const payloadMime = msgData.message?.payload?.mimeType;
      if (payloadMime === 'text/html' && payloadBody?.data) {
        body = decodeBase64(payloadBody.data);
        isHtml = true;
      } else {
        // 3. Fallback: check if gog-extracted body contains HTML tags
        isHtml = body.trim().startsWith('<') || body.includes('<html') || body.includes('<body')
          || /<(a|img|div|table|tr|td|p|br|span|picture|source|h[1-6])\b/i.test(body);
      }
    }

    const messageId = msgData.message?.id || threadId;

    // Resolve cid: image references in HTML body
    if (isHtml && body.includes('cid:')) {
      const cidParts = collectCidParts(parts);
      const allAttachments = msgData.attachments || [];
      body = body.replace(/src=["']cid:([^"']+)["']/gi, (_match: string, cid: string) => {
        // Match by CID or filename
        const cidPart = cidParts.find(p => p.cid === cid || p.filename === cid);
        const att = allAttachments.find((a: any) => a.filename === cid || a.filename === cidPart?.filename);
        if (att?.attachmentId) {
          return `src="/api/gmail/attachment?messageId=${messageId}&attachmentId=${encodeURIComponent(att.attachmentId)}&filename=${encodeURIComponent(att.filename || cid)}"`;
        }
        if (cidPart?.attachmentId) {
          return `src="/api/gmail/attachment?messageId=${messageId}&attachmentId=${encodeURIComponent(cidPart.attachmentId)}&filename=${encodeURIComponent(cidPart.filename)}"`;
        }
        return _match;
      });
    }

    // Try gog-provided attachments first
    let attachments = (msgData.attachments || []).map((att: any) => ({
      filename: att.filename || 'unknown',
      size: att.size || 0,
      sizeHuman: att.sizeHuman || '',
      mimeType: att.mimeType || 'application/octet-stream',
      attachmentId: att.attachmentId || '',
    }));

    // Fallback: extract attachments from MIME parts if gog didn't provide them
    if (attachments.length === 0 && parts.length > 0) {
      const mimeParts = collectAttachmentParts(parts);
      attachments = mimeParts.map(att => ({
        filename: att.filename,
        size: att.size,
        sizeHuman: att.size > 1024 * 1024
          ? `${(att.size / 1024 / 1024).toFixed(1)} MB`
          : `${Math.round(att.size / 1024)} KB`,
        mimeType: att.mimeType,
        attachmentId: att.attachmentId,
      }));
    }

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

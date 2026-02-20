import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const execAsync = promisify(exec);

const gogEnv = {
  ...process.env,
  PATH: '/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '/usr/bin:/bin'),
};

const account = 'chatgptnotes@gmail.com';

// GET: Download attachment
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get('messageId');
  const attachmentId = searchParams.get('attachmentId');
  const filename = searchParams.get('filename') || 'attachment';

  if (!messageId || !attachmentId) {
    return NextResponse.json({ error: 'messageId and attachmentId are required' }, { status: 400 });
  }

  const tempDir = tmpdir();
  const outPath = join(tempDir, filename);

  try {
    const cmd = `gog gmail attachment "${messageId}" "${attachmentId}" --out "${tempDir}" --name "${filename}" --account ${account} --force`;
    await execAsync(cmd, { timeout: 30000, env: gogEnv });

    const fileBuffer = await readFile(outPath);

    // Clean up temp file
    unlink(outPath).catch(() => {});

    // Determine content type
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
      csv: 'text/csv',
      zip: 'application/zip',
    };
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

    // For PDFs and images, display inline; otherwise download
    const isInline = ['pdf', 'png', 'jpg', 'jpeg', 'gif'].includes(ext || '');
    const disposition = isInline ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`;

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    // Clean up on error too
    unlink(outPath).catch(() => {});
    console.error('Attachment download error:', error);
    return NextResponse.json(
      { error: 'Failed to download attachment', details: error.stderr || error.message },
      { status: 500 }
    );
  }
}

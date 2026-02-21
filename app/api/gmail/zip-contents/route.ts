import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import JSZip from 'jszip';

const execAsync = promisify(exec);

const gogEnv = {
  ...process.env,
  PATH: '/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '/usr/bin:/bin'),
};

const account = 'chatgptnotes@gmail.com';

// In-memory cache for ZIP buffers (5 min TTL)
const zipCache = new Map<string, { buffer: Buffer; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getFromCache(key: string): Buffer | null {
  const entry = zipCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    zipCache.delete(key);
    return null;
  }
  return entry.buffer;
}

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
  html: 'text/html',
  xml: 'application/xml',
  json: 'application/json',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get('messageId');
  const attachmentId = searchParams.get('attachmentId');
  const filename = searchParams.get('filename') || 'archive.zip';
  const extractPath = searchParams.get('extract');

  if (!messageId || !attachmentId) {
    return NextResponse.json(
      { error: 'messageId and attachmentId are required' },
      { status: 400 }
    );
  }

  const cacheKey = `${messageId}:${attachmentId}`;

  try {
    // 1. Get ZIP buffer (from cache or download)
    let zipBuffer = getFromCache(cacheKey);

    if (!zipBuffer) {
      const tempDir = tmpdir();
      const tempName = `zip_${Date.now()}_${filename}`;
      const outPath = join(tempDir, tempName);

      const cmd = `gog gmail attachment "${messageId}" "${attachmentId}" --out "${tempDir}" --name "${tempName}" --account ${account} --force`;
      await execAsync(cmd, { timeout: 30000, env: gogEnv });

      zipBuffer = await readFile(outPath);
      unlink(outPath).catch(() => {});

      // Cache ZIPs under 10MB
      if (zipBuffer.length < 10 * 1024 * 1024) {
        zipCache.set(cacheKey, { buffer: zipBuffer, timestamp: Date.now() });
      }
    }

    // 2. Parse ZIP
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(zipBuffer);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or corrupted ZIP file' },
        { status: 422 }
      );
    }

    // 3. Extract mode — serve a specific file from inside the ZIP
    if (extractPath) {
      const file = zip.file(extractPath);
      if (!file) {
        return NextResponse.json(
          { error: `File not found in ZIP: ${extractPath}` },
          { status: 404 }
        );
      }

      const fileBuffer = await file.async('nodebuffer');
      const ext = extractPath.split('.').pop()?.toLowerCase() || '';
      const contentType = contentTypes[ext] || 'application/octet-stream';
      const isInline = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'txt', 'html'].includes(ext);
      const name = extractPath.split('/').pop() || extractPath;

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': isInline
            ? `inline; filename="${name}"`
            : `attachment; filename="${name}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    }

    // 4. List mode — return file listing
    const files: Array<{
      name: string;
      path: string;
      size: number;
      isDirectory: boolean;
      lastModified: string | null;
    }> = [];

    zip.forEach((relativePath, zipEntry) => {
      files.push({
        name: relativePath.split('/').filter(Boolean).pop() || relativePath,
        path: relativePath,
        size: (zipEntry as any)._data?.uncompressedSize ?? 0,
        isDirectory: zipEntry.dir,
        lastModified: zipEntry.date ? zipEntry.date.toISOString() : null,
      });
    });

    return NextResponse.json({
      zipFilename: filename,
      totalFiles: files.filter(f => !f.isDirectory).length,
      totalSize: files.reduce((acc, f) => acc + f.size, 0),
      files,
    });
  } catch (error: any) {
    console.error('ZIP contents error:', error);
    return NextResponse.json(
      { error: 'Failed to read ZIP contents', details: error.stderr || error.message },
      { status: 500 }
    );
  }
}

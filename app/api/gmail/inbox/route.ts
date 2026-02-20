import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const gogEnv = {
  ...process.env,
  PATH: '/usr/local/bin:/opt/homebrew/bin:' + (process.env.PATH || '/usr/bin:/bin'),
};

const account = 'chatgptnotes@gmail.com';

// GET: Fetch inbox emails
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'in:inbox';
    const max = searchParams.get('max') || '20';

    const searchCmd = `gog gmail search "${query}" --max ${max} -j --account ${account}`;
    const { stdout } = await execAsync(searchCmd, { timeout: 30000, env: gogEnv });

    const searchResult = JSON.parse(stdout);
    const threads = searchResult.threads || [];

    const emails = threads.map((thread: any) => ({
      threadId: thread.id,
      from: thread.from || 'Unknown',
      subject: thread.subject || '(no subject)',
      date: thread.date || '',
      snippet: thread.snippet || '',
      messageCount: thread.messageCount || 1,
      labels: thread.labels || [],
    }));

    return NextResponse.json({ emails });
  } catch (error: any) {
    console.error('Inbox fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inbox', details: error.stderr || error.message },
      { status: 500 }
    );
  }
}

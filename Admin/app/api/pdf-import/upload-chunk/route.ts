import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const UPLOAD_DIR = join(os.tmpdir(), 'pdf-chunks');

export async function POST(request: NextRequest) {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await request.formData();
    const chunk = formData.get('chunk') as File | null;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string, 10);
    const totalChunks = parseInt(formData.get('totalChunks') as string, 10);
    const filename = formData.get('filename') as string;
    const sessionId = formData.get('sessionId') as string;

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !sessionId) {
      return NextResponse.json({ success: false, error: 'Missing chunk data' }, { status: 400 });
    }

    console.log(`[PDF Chunk] ${chunkIndex + 1}/${totalChunks}: "${filename}" session=${sessionId.slice(0, 8)}`);

    const sessionDir = join(UPLOAD_DIR, sessionId);
    await mkdir(sessionDir, { recursive: true });

    const bytes = await chunk.arrayBuffer();
    await writeFile(join(sessionDir, `chunk-${chunkIndex}`), Buffer.from(bytes));

    console.log(`[PDF Chunk] ✅ Chunk ${chunkIndex + 1} saved (${(bytes.byteLength / 1024).toFixed(0)} KB)`);

    return NextResponse.json({ success: true, chunkIndex, totalChunks });
  } catch (error: any) {
    console.error('[PDF Chunk] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest } from 'next/server';
import { BOOK } from '@/domains/historia/content';

const PDF_FILENAME = 'A PRESENÇA DA MÚSICA NA HISTÓRIA LUMINARENSE (2023).pdf';

export async function GET(request: NextRequest) {
  const filePath = path.join(process.cwd(), 'src', 'assets', PDF_FILENAME);
  const data = await readFile(filePath);
  const inline = request.nextUrl.searchParams.get('inline') === '1';

  return new Response(data, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Length': String(data.byteLength),
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="${BOOK.downloadName}"`,
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

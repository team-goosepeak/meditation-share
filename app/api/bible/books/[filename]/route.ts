import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // 보안: 파일명 검증 (경로 탐색 공격 방지)
    if (!filename.match(/^\d{2}_[\w\s]+\.json$/)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }
    
    const filePath = path.join(
      process.cwd(),
      'supabase',
      'bible',
      'KorRV',
      'books',
      filename
    );
    
    const data = await fs.readFile(filePath, 'utf8');
    const book = JSON.parse(data);
    
    return NextResponse.json(book, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable', // 1년 캐싱
      },
    });
  } catch (error) {
    console.error('Error reading bible book:', error);
    return NextResponse.json(
      { error: 'Book not found' },
      { status: 404 }
    );
  }
}


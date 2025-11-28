import { NextRequest, NextResponse } from 'next/server';
import { getDocument } from '@/app/lib/netlify-storage';

// Using Netlify Blobs for persistent document storage
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string; docIndex: string } }
) {
  const { caseId, docIndex } = params;

  const docIndexNum = parseInt(docIndex);

  // Get document from Netlify Blobs
  const document = await getDocument(caseId, docIndexNum);

  if (!document) {
    return NextResponse.json(
      { error: 'Document not found - it may have been cleaned up or the case/document index is invalid' },
      { status: 404 }
    );
  }

  // Return document content as markdown file
  return new NextResponse(document.content, {
    headers: {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="${document.title}"`,
    },
  });
}

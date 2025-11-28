import { NextRequest, NextResponse } from 'next/server';

// In-memory storage (shared with generate route) - works on Netlify
const globalForProgress = global as unknown as { progress?: Map<string, any> };
const progress = globalForProgress.progress ?? new Map<string, any>();

// Always persist to global - Netlify functions have better instance reuse
globalForProgress.progress = progress;

export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const caseId = params.caseId;

  const progressData = progress.get(caseId);

  if (!progressData) {
    return NextResponse.json(
      {
        stage: 'Not Found',
        progress: 0,
        message: 'Case not found',
        status: 'error',
        error: 'Case ID not found',
      },
      { status: 404 }
    );
  }

  return NextResponse.json(progressData);
}

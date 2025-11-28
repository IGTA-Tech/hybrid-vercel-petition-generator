import { NextRequest, NextResponse } from 'next/server';
import { getProgress } from '@/app/lib/netlify-storage';

// Using Netlify Blobs for persistent progress tracking
export async function GET(
  request: NextRequest,
  { params }: { params: { caseId: string } }
) {
  const caseId = params.caseId;

  // Get progress from Netlify Blobs
  const progressData = await getProgress(caseId);

  if (!progressData) {
    return NextResponse.json(
      {
        stage: 'Not Found',
        progress: 0,
        message: 'Case not found - it may have been cleaned up or the ID is invalid',
        status: 'error',
        error: 'Case ID not found',
      },
      { status: 404 }
    );
  }

  // Convert to format expected by frontend
  return NextResponse.json({
    stage: progressData.currentStep,
    progress: progressData.progress,
    message: progressData.message,
    status: progressData.progress === 100 ? 'completed' : 'processing',
  });
}

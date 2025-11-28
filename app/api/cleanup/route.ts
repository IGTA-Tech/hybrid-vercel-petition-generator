import { NextRequest, NextResponse } from 'next/server';
import { cleanup } from '@/app/lib/netlify-storage';

/**
 * Cleanup endpoint to delete case data from Netlify Blobs
 * Deletes all uploaded files, generated documents, case metadata, and progress data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { caseId } = body;

    if (!caseId) {
      return NextResponse.json(
        { error: 'caseId is required' },
        { status: 400 }
      );
    }

    // Don't allow cleanup of 'temp' prefix (too broad)
    if (caseId === 'temp' || caseId.startsWith('temp_')) {
      return NextResponse.json(
        { error: 'Cannot cleanup generic "temp" prefix. Provide specific caseId.' },
        { status: 400 }
      );
    }

    console.log(`[Cleanup] Starting cleanup for caseId: ${caseId}`);

    // Delete all case data from Netlify Blobs
    const deletedCount = await cleanup(caseId);

    console.log(`[Cleanup] Completed for caseId: ${caseId}. Deleted ${deletedCount} items.`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} items for case ${caseId}`,
      itemsDeleted: deletedCount,
    });
  } catch (error: any) {
    console.error('[Cleanup] Error during cleanup:', error);
    return NextResponse.json(
      {
        error: 'Failed to cleanup files',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

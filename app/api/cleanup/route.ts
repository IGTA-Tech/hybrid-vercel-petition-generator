import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Cleanup endpoint to delete temporary files from local /tmp storage
 * Deletes all files with a specific caseId prefix
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
    if (caseId === 'temp') {
      return NextResponse.json(
        { error: 'Cannot cleanup generic "temp" prefix. Provide specific caseId.' },
        { status: 400 }
      );
    }

    console.log(`Starting cleanup for caseId: ${caseId}`);

    // Clean up /tmp/uploads directory
    const tempDir = path.join('/tmp', 'uploads', caseId);
    let filesDeleted = 0;

    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      filesDeleted = files.length;

      // Delete all files in the directory
      files.forEach(file => {
        fs.unlinkSync(path.join(tempDir, file));
      });

      // Remove the directory
      fs.rmdirSync(tempDir);

      console.log(`Cleanup completed for caseId: ${caseId}. Deleted ${filesDeleted} files.`);
    } else {
      console.log(`No files found for caseId: ${caseId}`);
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${filesDeleted} files for case ${caseId}`,
      filesDeleted,
    });
  } catch (error: any) {
    console.error('Error during cleanup:', error);
    return NextResponse.json(
      {
        error: 'Failed to cleanup files',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { processFile } from '@/app/lib/file-processor';
import { uploadFile } from '@/app/lib/netlify-storage';

// Netlify Blobs file upload - persistent storage across function instances
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'image/jpeg',
      'image/png',
      'text/plain',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, DOCX, DOC, JPG, PNG, TXT' },
        { status: 400 }
      );
    }

    // Get caseId from query params or generate temporary one
    const url = new URL(request.url);
    const caseId = url.searchParams.get('caseId') || `temp_${Date.now()}`;

    // Convert file to buffer
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate unique filename
    const fileName = `${Date.now()}_${file.name}`;

    // Upload to Netlify Blobs (persistent storage)
    const blobKey = await uploadFile(caseId, fileName, fileBuffer);
    console.log(`[Upload] Uploaded ${fileName} to Netlify Blobs: ${blobKey}`);

    // Process file to extract text
    const processed = await processFile(file);

    return NextResponse.json({
      success: true,
      blob: {
        url: blobKey,
        pathname: blobKey,
        downloadUrl: blobKey,
      },
      processed: {
        fileName: processed.fileName,
        fileType: processed.fileType,
        wordCount: processed.wordCount,
        pageCount: processed.pageCount,
        summary: processed.summary,
        extractedText: processed.extractedText, // Include full text for autofill
        // Store blob key for later retrieval
        blobUrl: blobKey,
      },
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

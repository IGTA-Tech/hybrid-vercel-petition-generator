import { NextRequest, NextResponse } from 'next/server';
import { processFile } from '@/app/lib/file-processor';
import fs from 'fs';
import path from 'path';

// Netlify-compatible file upload using local /tmp storage
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

    // Save to local /tmp directory (works on Netlify)
    const tempDir = path.join('/tmp', 'uploads', caseId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fileName = `${Date.now()}_${file.name}`;
    const filePath = path.join(tempDir, fileName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, fileBuffer);

    // Process file to extract text
    const processed = await processFile(file);

    // Create a local URL for the file
    const localUrl = `/tmp/uploads/${caseId}/${fileName}`;

    return NextResponse.json({
      success: true,
      blob: {
        url: localUrl,
        pathname: filePath,
        downloadUrl: localUrl,
      },
      processed: {
        fileName: processed.fileName,
        fileType: processed.fileType,
        wordCount: processed.wordCount,
        pageCount: processed.pageCount,
        summary: processed.summary,
        extractedText: processed.extractedText, // Include full text for autofill
        // Store local file path for later access
        blobUrl: localUrl,
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

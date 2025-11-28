import { NextRequest, NextResponse } from 'next/server';
import { BeneficiaryInfo, PetitionCase } from '@/app/types';
import { generateAllDocuments } from '@/app/lib/document-generator';
import { sendDocumentsEmail } from '@/app/lib/email-service';
import {
  saveCase,
  getCase,
  updateProgress,
  updateCaseStatus,
  saveDocument,
} from '@/app/lib/netlify-storage';

// Using Netlify Blobs for persistent storage across function instances

export async function POST(request: NextRequest) {
  try {
    const beneficiaryInfo: BeneficiaryInfo = await request.json();

    // Validate input
    if (!beneficiaryInfo.fullName || !beneficiaryInfo.visaType || !beneficiaryInfo.recipientEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use caseId from client if provided, otherwise generate new one
    // This ensures files uploaded earlier use the same caseId as the generation process
    const caseId = beneficiaryInfo.caseId || `case_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize case in Netlify Blobs
    const petitionCase = {
      caseId,
      beneficiary: {
        name: beneficiaryInfo.fullName,
        visaType: beneficiaryInfo.visaType,
        field: beneficiaryInfo.field || '',
        email: beneficiaryInfo.recipientEmail,
        achievements: beneficiaryInfo.achievements,
        background: beneficiaryInfo.background,
        urls: beneficiaryInfo.urls,
      },
      status: 'processing' as const,
      uploadedDocs: beneficiaryInfo.uploadedDocuments?.map(doc => ({
        fileName: doc.fileName,
        blobKey: doc.blobUrl,
        size: doc.wordCount || 0,
        type: doc.fileType || 'unknown',
      })) || [],
      generatedDocs: [],
      createdAt: Date.now(),
    };

    // Save case to Netlify Blobs
    await saveCase(caseId, petitionCase);
    console.log(`[Generate] Created case ${caseId} in Netlify Blobs`);

    // Initialize progress in Netlify Blobs
    await updateProgress(caseId, {
      currentStep: 'Initializing',
      progress: 0,
      message: 'Starting document generation...',
    });

    // Start generation in background - NO AWAIT!
    // This allows 30+ minute generations without timeout
    generateDocumentsAsync(caseId, beneficiaryInfo);

    return NextResponse.json({ caseId, status: 'processing' });
  } catch (error: any) {
    console.error('Error starting generation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateDocumentsAsync(caseId: string, beneficiaryInfo: BeneficiaryInfo) {
  try {
    // Generate documents with progress updates to Netlify Blobs
    const result = await generateAllDocuments(beneficiaryInfo, async (stage, prog, message) => {
      await updateProgress(caseId, {
        currentStep: stage,
        progress: prog,
        message,
      });
    });

    // Prepare documents with descriptive names
    const cleanName = beneficiaryInfo.fullName.replace(/\s/g, '_');
    const visaType = beneficiaryInfo.visaType || 'O-1A';

    const documents = [
      {
        id: 'doc1',
        name: `${cleanName}_${visaType}_Evidence_Portfolio_and_Impact_Analysis.md`,
        content: result.document1,
        pageCount: Math.ceil(result.document1.length / 2500),
        timestamp: new Date(),
      },
      {
        id: 'doc2',
        name: `${cleanName}_${visaType}_Publications_and_Citations_Report.md`,
        content: result.document2,
        pageCount: Math.ceil(result.document2.length / 2500),
        timestamp: new Date(),
      },
      {
        id: 'doc3',
        name: `${cleanName}_${visaType}_Research_and_Source_Documentation.md`,
        content: result.document3,
        pageCount: Math.ceil(result.document3.length / 2500),
        timestamp: new Date(),
      },
      {
        id: 'doc4',
        name: `${cleanName}_${visaType}_Legal_Brief_and_Petition_Summary.md`,
        content: result.document4,
        pageCount: Math.ceil(result.document4.length / 2500),
        timestamp: new Date(),
      },
    ];

    // Save documents to Netlify Blobs instead of local filesystem
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const blobKey = await saveDocument(caseId, i, {
        title: doc.name,
        content: doc.content,
      });
      console.log(`[Generate] Saved document ${i} to Netlify Blobs: ${blobKey}`);
    }

    // Update case status to completed
    await updateCaseStatus(caseId, 'completed');
    console.log(`[Generate] Case ${caseId} completed successfully`);

    // Send email
    await updateProgress(caseId, {
      currentStep: 'Sending Email',
      progress: 95,
      message: 'Sending documents to your email...',
    });

    const emailSent = await sendDocumentsEmail(beneficiaryInfo, documents);

    // Update final progress
    await updateProgress(caseId, {
      currentStep: 'Complete',
      progress: 100,
      message: emailSent
        ? 'Documents generated and emailed successfully!'
        : 'Documents generated! (Email delivery failed - please download manually)',
    });

    console.log(`[Generate] Case ${caseId} finished. Email sent: ${emailSent}`);
  } catch (error: any) {
    console.error('Error generating documents:', error);

    await updateProgress(caseId, {
      currentStep: 'Error',
      progress: 0,
      message: 'An error occurred during generation: ' + error.message,
    });

    await updateCaseStatus(caseId, 'failed', error.message);
  }
}

/**
 * Netlify Blobs Storage Utility
 *
 * Provides persistent storage for visa petition cases, files, and progress tracking
 * using Netlify Blobs (key-value store + file storage).
 *
 * Stores:
 * - cases: Case metadata and beneficiary information
 * - uploads: Uploaded PDF files
 * - documents: Generated petition documents
 */

import { getStore } from '@netlify/blobs';

// Types
export interface PetitionCase {
  caseId: string;
  beneficiary: {
    name: string;
    visaType: string;
    field: string;
    email: string;
    achievements?: string;
    background?: string;
    urls?: string[];
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  uploadedDocs: Array<{
    fileName: string;
    blobKey: string;
    size: number;
    type: string;
  }>;
  generatedDocs: Array<{
    title: string;
    blobKey: string;
    content?: string;
  }>;
  createdAt: number;
  completedAt?: number;
  error?: string;
}

export interface ProgressData {
  caseId: string;
  currentStep: string;
  progress: number;
  message: string;
  totalSteps?: number;
  completedSteps?: number;
  updatedAt: number;
}

// Get store instances
const getCasesStore = () => getStore({ name: 'cases', consistency: 'strong' });
const getUploadsStore = () => getStore({ name: 'uploads' });
const getDocumentsStore = () => getStore({ name: 'documents' });

/**
 * Save case metadata
 */
export async function saveCase(caseId: string, caseData: PetitionCase): Promise<void> {
  const store = getCasesStore();
  await store.setJSON(caseId, caseData);
  console.log(`[Storage] Saved case ${caseId} to Netlify Blobs`);
}

/**
 * Retrieve case metadata
 */
export async function getCase(caseId: string): Promise<PetitionCase | null> {
  const store = getCasesStore();
  const data = await store.get(caseId, { type: 'json' });

  if (!data) {
    console.log(`[Storage] Case ${caseId} not found in Netlify Blobs`);
    return null;
  }

  console.log(`[Storage] Retrieved case ${caseId} from Netlify Blobs`);
  return data as PetitionCase;
}

/**
 * Update case status
 */
export async function updateCaseStatus(
  caseId: string,
  status: PetitionCase['status'],
  error?: string
): Promise<void> {
  const caseData = await getCase(caseId);
  if (!caseData) {
    throw new Error(`Case ${caseId} not found`);
  }

  caseData.status = status;
  if (error) {
    caseData.error = error;
  }
  if (status === 'completed' || status === 'failed') {
    caseData.completedAt = Date.now();
  }

  await saveCase(caseId, caseData);
  console.log(`[Storage] Updated case ${caseId} status to ${status}`);
}

/**
 * Update progress for a case
 */
export async function updateProgress(caseId: string, progressData: Partial<ProgressData>): Promise<void> {
  const store = getCasesStore();
  const progressKey = `progress:${caseId}`;

  // Get existing progress or create new
  const existing = await store.get(progressKey, { type: 'json' }) as ProgressData | null;

  const updated: ProgressData = {
    caseId,
    currentStep: progressData.currentStep || existing?.currentStep || 'Starting',
    progress: progressData.progress !== undefined ? progressData.progress : existing?.progress || 0,
    message: progressData.message || existing?.message || 'Initializing...',
    totalSteps: progressData.totalSteps || existing?.totalSteps,
    completedSteps: progressData.completedSteps || existing?.completedSteps,
    updatedAt: Date.now(),
  };

  await store.setJSON(progressKey, updated);
  console.log(`[Storage] Updated progress for ${caseId}: ${updated.progress}% - ${updated.message}`);
}

/**
 * Get current progress for a case
 */
export async function getProgress(caseId: string): Promise<ProgressData | null> {
  const store = getCasesStore();
  const progressKey = `progress:${caseId}`;

  const data = await store.get(progressKey, { type: 'json' });

  if (!data) {
    console.log(`[Storage] No progress found for ${caseId}`);
    return null;
  }

  return data as ProgressData;
}

/**
 * Upload a file (PDF, image, etc.)
 */
export async function uploadFile(
  caseId: string,
  fileName: string,
  fileBuffer: Buffer | Uint8Array
): Promise<string> {
  const store = getUploadsStore();
  const blobKey = `${caseId}/${fileName}`;

  // Convert to ArrayBuffer for Netlify Blobs compatibility
  const arrayBuffer = fileBuffer instanceof Buffer
    ? fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer
    : fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer;

  await store.set(blobKey, arrayBuffer);
  console.log(`[Storage] Uploaded file ${fileName} for case ${caseId} (${fileBuffer.length} bytes)`);

  return blobKey;
}

/**
 * Get an uploaded file
 */
export async function getFile(caseId: string, fileName: string): Promise<Buffer | null> {
  const store = getUploadsStore();
  const blobKey = `${caseId}/${fileName}`;

  const data = await store.get(blobKey, { type: 'arrayBuffer' });

  if (!data) {
    console.log(`[Storage] File ${fileName} not found for case ${caseId}`);
    return null;
  }

  console.log(`[Storage] Retrieved file ${fileName} for case ${caseId}`);
  return Buffer.from(data);
}

/**
 * Get file by blob key
 */
export async function getFileByKey(blobKey: string): Promise<Buffer | null> {
  const store = getUploadsStore();

  const data = await store.get(blobKey, { type: 'arrayBuffer' });

  if (!data) {
    console.log(`[Storage] File not found at key ${blobKey}`);
    return null;
  }

  console.log(`[Storage] Retrieved file from key ${blobKey}`);
  return Buffer.from(data);
}

/**
 * Save a generated document
 */
export async function saveDocument(
  caseId: string,
  docIndex: number,
  documentData: {
    title: string;
    content: string;
    pdfBuffer?: Buffer;
  }
): Promise<string> {
  const store = getDocumentsStore();
  const blobKey = `${caseId}/doc-${docIndex}.json`;

  // Store document metadata and content
  await store.setJSON(blobKey, {
    title: documentData.title,
    content: documentData.content,
    createdAt: Date.now(),
  });

  // If PDF buffer provided, store it separately
  if (documentData.pdfBuffer) {
    const pdfKey = `${caseId}/doc-${docIndex}.pdf`;
    // Convert Buffer to ArrayBuffer for Netlify Blobs compatibility
    const arrayBuffer = documentData.pdfBuffer.buffer.slice(
      documentData.pdfBuffer.byteOffset,
      documentData.pdfBuffer.byteOffset + documentData.pdfBuffer.byteLength
    ) as ArrayBuffer;
    await store.set(pdfKey, arrayBuffer);
    console.log(`[Storage] Saved PDF for document ${docIndex} in case ${caseId}`);
  }

  console.log(`[Storage] Saved document ${docIndex} for case ${caseId}`);
  return blobKey;
}

/**
 * Get a generated document
 */
export async function getDocument(caseId: string, docIndex: number): Promise<{
  title: string;
  content: string;
  createdAt: number;
} | null> {
  const store = getDocumentsStore();
  const blobKey = `${caseId}/doc-${docIndex}.json`;

  const data = await store.get(blobKey, { type: 'json' });

  if (!data) {
    console.log(`[Storage] Document ${docIndex} not found for case ${caseId}`);
    return null;
  }

  console.log(`[Storage] Retrieved document ${docIndex} for case ${caseId}`);
  return data as { title: string; content: string; createdAt: number };
}

/**
 * Get a generated document PDF
 */
export async function getDocumentPDF(caseId: string, docIndex: number): Promise<Buffer | null> {
  const store = getDocumentsStore();
  const pdfKey = `${caseId}/doc-${docIndex}.pdf`;

  const data = await store.get(pdfKey, { type: 'arrayBuffer' });

  if (!data) {
    console.log(`[Storage] PDF not found for document ${docIndex} in case ${caseId}`);
    return null;
  }

  console.log(`[Storage] Retrieved PDF for document ${docIndex} in case ${caseId}`);
  return Buffer.from(data);
}

/**
 * Add a generated document to the case
 */
export async function addGeneratedDocument(
  caseId: string,
  docIndex: number,
  title: string,
  blobKey: string
): Promise<void> {
  const caseData = await getCase(caseId);
  if (!caseData) {
    throw new Error(`Case ${caseId} not found`);
  }

  caseData.generatedDocs.push({
    title,
    blobKey,
  });

  await saveCase(caseId, caseData);
  console.log(`[Storage] Added generated document "${title}" to case ${caseId}`);
}

/**
 * Cleanup all data for a case
 */
export async function cleanup(caseId: string): Promise<number> {
  let deletedCount = 0;

  try {
    // Get case data to find all blob keys
    const caseData = await getCase(caseId);

    if (caseData) {
      // Delete uploaded files
      const uploadsStore = getUploadsStore();
      for (const doc of caseData.uploadedDocs) {
        await uploadsStore.delete(doc.blobKey);
        deletedCount++;
      }

      // Delete generated documents
      const documentsStore = getDocumentsStore();
      for (let i = 0; i < caseData.generatedDocs.length; i++) {
        await documentsStore.delete(`${caseId}/doc-${i}.json`);
        await documentsStore.delete(`${caseId}/doc-${i}.pdf`);
        deletedCount += 2;
      }
    }

    // Delete case metadata and progress
    const casesStore = getCasesStore();
    await casesStore.delete(caseId);
    await casesStore.delete(`progress:${caseId}`);
    deletedCount += 2;

    console.log(`[Storage] Cleaned up ${deletedCount} items for case ${caseId}`);
    return deletedCount;
  } catch (error) {
    console.error(`[Storage] Error cleaning up case ${caseId}:`, error);
    return deletedCount;
  }
}

/**
 * List all cases (for debugging/admin)
 */
export async function listCases(): Promise<string[]> {
  const store = getCasesStore();
  const { blobs } = await store.list();

  // Filter out progress entries and return only case IDs
  const caseIds = blobs
    .map(blob => blob.key)
    .filter(key => !key.startsWith('progress:'));

  console.log(`[Storage] Found ${caseIds.length} cases in Netlify Blobs`);
  return caseIds;
}

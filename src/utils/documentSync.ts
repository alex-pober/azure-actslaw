import { makeSmartAdvocateRequest } from './smartAdvocateApi';
import type { SmartAdvocateDocument, AzureBlobFile, DocumentSyncStatus, SyncSummary } from '../types/document';

const AZURE_BLOB_BASE_URL = 'https://actsaidev8146.blob.core.windows.net/sadocsstorage';
const AZURE_SAS_TOKEN = 'st=2025-07-28T04:37:49Z&se=2027-09-01T12:52:49Z&si=webappa-access&spr=https&sv=2024-11-04&sr=c&sig=KLL3QtR6lqJFVwuowQFSA7qnU%2BzBqmjtpo6yeHaA9K4%3D';

export async function getSmartAdvocateDocuments(
  caseId: string,
  bearerToken: string,
  onTokenExpired?: () => void
): Promise<SmartAdvocateDocument[]> {
  const response = await makeSmartAdvocateRequest(
    `/case/${encodeURIComponent(caseId)}/documents`,
    { bearerToken, onTokenExpired },
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.statusText}`);
  }

  const documents = await response.json();
  console.log('SmartAdvocate Documents Response:', {
    caseId,
    totalDocuments: documents.length,
    documents: documents.map((doc: SmartAdvocateDocument) => ({
      documentID: doc.documentID,
      documentName: doc.documentName,
      categoryName: doc.categoryName,
      subCategoryName: doc.subCategoryName,
      caseNumber: doc.caseNumber
    }))
  });
  
  return documents;
}

export function generateAzureBlobPath(caseNumber: string, categoryName: string, subCategoryName: string): string {
  // Clean up category names for file path (remove special characters, spaces, etc.)
  const cleanCategoryName = categoryName.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanSubCategoryName = subCategoryName.replace(/[^a-zA-Z0-9]/g, '_');
  
  console.log('Generated Azure blob path:', {
    caseNumber,
    originalCategoryName: categoryName,
    originalSubCategoryName: subCategoryName,
    cleanCategoryName,
    cleanSubCategoryName,
    finalPath: `/default/${caseNumber}/${cleanCategoryName}/${cleanSubCategoryName}`
  });
  
  return `/default/${caseNumber}/${cleanCategoryName}/${cleanSubCategoryName}`;
}

export function generateExpectedFileName(document: SmartAdvocateDocument): string {
  // Return the document name as-is for initial comparison
  // We'll handle different naming patterns in the matching logic
  return document.documentName;
}

export async function checkAzureBlobExists(blobPath: string, fileName: string): Promise<boolean> {
  try {
    // List all files in the blob path to find files that end with our expected filename
    const blobFiles = await listAzureBlobFiles(blobPath);
    
    // Check if any file matches our expected filename using multiple strategies
    const matchingFile = blobFiles.find(file => {
      // Remove unique ID prefix pattern (anything before and including the first underscore)
      const cleanFileName = file.name.replace(/^[^_]+_/, '');
      
      // Strategy 1: Exact match
      const exactMatch = cleanFileName === fileName;
      
      // Strategy 2: Sanitized match (replace special chars with underscores in both)
      const sanitizedCleanFileName = cleanFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const sanitizedExpectedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const sanitizedMatch = sanitizedCleanFileName === sanitizedExpectedFileName;
      
      // Strategy 3: Partial match - check if the expected filename contains key parts of the blob filename
      // Extract the core parts without special characters for loose matching
      const coreCleanFileName = cleanFileName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const coreExpectedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      const partialMatch = coreCleanFileName.includes(coreExpectedFileName.substring(0, Math.min(20, coreExpectedFileName.length))) ||
                          coreExpectedFileName.includes(coreCleanFileName.substring(0, Math.min(20, coreCleanFileName.length)));
      
      return exactMatch || sanitizedMatch || partialMatch;
    });
    
    const exists = !!matchingFile;
    
    // Only log when there's NO match and we want to debug why
    if (!exists && blobFiles.length > 0) {
      console.log('🔍 NO MATCH FOUND - Debug Info:', {
        searchPath: blobPath,
        expectedFileName: fileName,
        foundBlobFiles: blobFiles.map(f => f.name),
        detailedComparison: blobFiles.map(file => {
          const cleanFileName = file.name.replace(/^[^_]+_/, '');
          const sanitizedCleanFileName = cleanFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
          const sanitizedExpectedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
          const coreCleanFileName = cleanFileName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          const coreExpectedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
          
          return {
            originalFileName: file.name,
            cleanFileName,
            sanitizedCleanFileName,
            sanitizedExpectedFileName,
            coreCleanFileName: coreCleanFileName.substring(0, 30),
            coreExpectedFileName: coreExpectedFileName.substring(0, 30),
            exactMatch: cleanFileName === fileName,
            sanitizedMatch: sanitizedCleanFileName === sanitizedExpectedFileName,
            partialMatch: coreCleanFileName.includes(coreExpectedFileName.substring(0, Math.min(20, coreExpectedFileName.length))) ||
                         coreExpectedFileName.includes(coreCleanFileName.substring(0, Math.min(20, coreCleanFileName.length)))
          };
        })
      });
    } else if (!exists && blobFiles.length === 0) {
      console.log('❌ NO FILES FOUND IN FOLDER - Debug Folder Listing:', {
        searchPath: blobPath,
        expectedFileName: fileName,
        message: 'The Azure blob folder is empty or does not exist'
      });
      
      // Additional debugging: try listing parent folder to see actual structure
      const parentPath = blobPath.split('/').slice(0, -1).join('/');
      if (parentPath !== blobPath) {
        console.log('🔍 Checking parent folder structure...');
        const parentFiles = await listAzureBlobFiles(parentPath);
        console.log('Files in parent folder:', {
          parentPath,
          files: parentFiles.map(f => f.path)
        });
      }
      
      // Also try the case root folder
      const caseRootPath = `/default/${blobPath.split('/')[2]}`;
      if (caseRootPath !== parentPath) {
        console.log('🔍 Checking case root folder structure...');
        const caseRootFiles = await listAzureBlobFiles(caseRootPath);
        console.log('Files in case root folder:', {
          caseRootPath,
          files: caseRootFiles.map(f => f.path)
        });
      }
    }
    
    return exists;
  } catch (error) {
    console.error('Error checking Azure blob:', error);
    return false;
  }
}

export async function listAzureBlobFiles(blobPath: string): Promise<AzureBlobFile[]> {
  try {
    // Azure Blob Storage REST API call to list files with SAS token authentication
    // Remove leading slash and ensure proper prefix format for Azure blob listing
    const prefix = blobPath.replace(/^\//, '').replace(/\/$/, '');
    const listUrl = `${AZURE_BLOB_BASE_URL}?comp=list&restype=container&prefix=${encodeURIComponent(prefix)}&${AZURE_SAS_TOKEN}&include=metadata`;
    
    const response = await fetch(listUrl, {
      method: 'GET',
      headers: {
        'x-ms-version': '2020-04-08',
      },
    });

    if (!response.ok) {
        return [];
    }

    // Parse XML response (Azure returns XML for blob listings)
    const xmlText = await response.text();
    
    // Parse blob information including metadata
    const blobFiles: AzureBlobFile[] = [];
    const blobMatches = xmlText.match(/<Blob>[\s\S]*?<\/Blob>/g);
    
    if (blobMatches) {
      blobMatches.forEach(blobMatch => {
        const nameMatch = blobMatch.match(/<Name>([^<]+)<\/Name>/);
        if (nameMatch) {
          const fullPath = nameMatch[1];
          const fileName = fullPath.split('/').pop() || fullPath;
          
          // Extract metadata if present
          const metadata: any = {};
          const metadataMatch = blobMatch.match(/<Metadata>([\s\S]*?)<\/Metadata>/);
          if (metadataMatch) {
            const metadataXml = metadataMatch[1];
            // Parse individual metadata fields
            const documentIdMatch = metadataXml.match(/<documentid>([^<]*)<\/documentid>/i);
            const caseIdMatch = metadataXml.match(/<caseid>([^<]*)<\/caseid>/i);
            const categoryNameMatch = metadataXml.match(/<categoryname>([^<]*)<\/categoryname>/i);
            const subCategoryNameMatch = metadataXml.match(/<subcategoryname>([^<]*)<\/subcategoryname>/i);
            const createdDateMatch = metadataXml.match(/<createddate>([^<]*)<\/createddate>/i);
            const modifiedDateMatch = metadataXml.match(/<modifieddate>([^<]*)<\/modifieddate>/i);
            const descriptionMatch = metadataXml.match(/<description>([^<]*)<\/description>/i);
            const documentDirectionMatch = metadataXml.match(/<documentdirection>([^<]*)<\/documentdirection>/i);
            const priorityMatch = metadataXml.match(/<priority>([^<]*)<\/priority>/i);
            const userIdMatch = metadataXml.match(/<userid>([^<]*)<\/userid>/i);
            
            if (documentIdMatch) metadata.documentId = documentIdMatch[1];
            if (caseIdMatch) metadata.caseId = caseIdMatch[1];
            if (categoryNameMatch) metadata.categoryName = categoryNameMatch[1];
            if (subCategoryNameMatch) metadata.subCategoryName = subCategoryNameMatch[1];
            if (createdDateMatch) metadata.createdDate = createdDateMatch[1];
            if (modifiedDateMatch) metadata.modifiedDate = modifiedDateMatch[1];
            if (descriptionMatch) metadata.description = descriptionMatch[1];
            if (documentDirectionMatch) metadata.documentDirection = documentDirectionMatch[1];
            if (priorityMatch) metadata.priority = priorityMatch[1];
            if (userIdMatch) metadata.userId = userIdMatch[1];
          }
          
          blobFiles.push({
            name: fileName,
            path: fullPath,
            size: 0, // Would need to parse from XML for actual size
            lastModified: '',
            contentType: '',
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined
          });
        }
      });
    }
    
    return blobFiles;
  } catch (error) {
    console.error('Error listing Azure blob files:', error);
    return [];
  }
}

export async function checkDocumentSyncByMetadata(
  document: SmartAdvocateDocument,
  caseNumber: string
): Promise<{ isSynced: boolean; matchedFile?: AzureBlobFile }> {
  try {
    // List all files in the case folder to search by metadata
    const caseFolderPath = `/default/${caseNumber}`;
    const blobFiles = await listAzureBlobFiles(caseFolderPath);
    
    // Find a blob file that matches the SmartAdvocate document by metadata
    const matchingFile = blobFiles.find(file => {
      if (!file.metadata) return false;
      
      // Primary match: documentId
      const documentIdMatch = file.metadata.documentId === document.documentID.toString();
      
      // Secondary match: caseId + categoryName + subCategoryName
      const caseIdMatch = file.metadata.caseId === document.caseID.toString();
      const categoryMatch = file.metadata.categoryName === document.categoryName;
      const subCategoryMatch = file.metadata.subCategoryName === document.subCategoryName;
      const secondaryMatch = caseIdMatch && categoryMatch && subCategoryMatch;
      
      return documentIdMatch || secondaryMatch;
    });
    
    const isSynced = !!matchingFile;
    
    // Only log when there's NO match and we want to debug why
    if (!isSynced && blobFiles.length > 0) {
      const filesWithMetadata = blobFiles.filter(f => f.metadata);
      console.log('🔍 NO METADATA MATCH FOUND - Debug Info:', {
        smartAdvocateDocument: {
          documentID: document.documentID,
          caseID: document.caseID,
          categoryName: document.categoryName,
          subCategoryName: document.subCategoryName,
          documentName: document.documentName
        },
        totalBlobFiles: blobFiles.length,
        filesWithMetadata: filesWithMetadata.length,
        blobFilesMetadata: filesWithMetadata.map(file => ({
          fileName: file.name,
          metadata: file.metadata
        }))
      });
    } else if (!isSynced && blobFiles.length === 0) {
      console.log('❌ NO FILES FOUND IN CASE FOLDER:', {
        caseFolderPath,
        documentID: document.documentID,
        message: 'The case folder is empty or does not exist'
      });
    }
    
    return { isSynced, matchedFile: matchingFile };
  } catch (error) {
    console.error('Error checking document sync by metadata:', error);
    return { isSynced: false };
  }
}

export async function analyzeDocumentSync(
  documents: SmartAdvocateDocument[],
  caseNumber: string
): Promise<DocumentSyncStatus[]> {
  const syncStatuses: DocumentSyncStatus[] = [];

  for (const document of documents) {
    const { isSynced, matchedFile } = await checkDocumentSyncByMetadata(document, caseNumber);
    
    const azureBlobPath = matchedFile?.path || generateAzureBlobPath(
      caseNumber,
      document.categoryName,
      document.subCategoryName
    );

    syncStatuses.push({
      smartAdvocateDocument: document,
      azureBlobPath,
      isSynced,
      syncedFileName: matchedFile?.name,
    });
  }

  return syncStatuses;
}

export function generateSyncSummary(syncStatuses: DocumentSyncStatus[]): SyncSummary {
  const totalDocuments = syncStatuses.length;
  const syncedDocuments = syncStatuses.filter(status => status.isSynced).length;
  const unsyncedDocuments = totalDocuments - syncedDocuments;
  const syncPercentage = totalDocuments > 0 ? Math.round((syncedDocuments / totalDocuments) * 100) : 0;

  return {
    totalSmartAdvocateDocuments: totalDocuments,
    totalSyncedDocuments: syncedDocuments,
    totalUnsyncedDocuments: unsyncedDocuments,
    syncPercentage,
    lastSyncCheck: new Date().toISOString(),
  };
}

export class DocumentSyncError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentSyncError';
  }
}
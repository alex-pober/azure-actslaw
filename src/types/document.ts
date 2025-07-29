export interface SmartAdvocateDocument {
  documentID: number;
  caseID: number;
  caseNumber: string;
  documentName: string;
  fromUniqueContactID: number;
  toContactName: string;
  fromContactName: string;
  docType: string;
  templateID: number;
  attachFlag: boolean;
  description: string;
  docsrflag?: string;
  createdUserID: number;
  createdDate: string;
  modifiedUserID?: number;
  modifiedDate?: string;
  categoryID: number;
  categoryName: string;
  subCategoryID: number;
  subCategoryName: string;
  subSubCategoryID?: number;
  subSubSubCategoryID?: number;
  comments?: string;
  isReviewed: boolean;
  toUniqueContactID: number;
  documentDate: string;
  priority: number;
  priorityName: string;
  documentDirection: number;
  directionName: string;
  documentOrigin: number;
  originName: string;
  isSharedInPortal: boolean;
  isSharedWithEveryoneInPortal?: boolean;
  deliveryMethodId?: number;
  deliveryName?: string;
  caseDocumentID: number;
  medProvUniqueContactID?: number;
  medProviderName?: string;
}

export interface AzureBlobFile {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  contentType: string;
  metadata?: {
    documentId?: string;
    caseId?: string;
    categoryName?: string;
    subCategoryName?: string;
    createdDate?: string;
    modifiedDate?: string;
    description?: string;
    documentDirection?: string;
    priority?: string;
    userId?: string;
  };
}

export interface DocumentSyncStatus {
  smartAdvocateDocument: SmartAdvocateDocument;
  azureBlobPath: string;
  isSynced: boolean;
  syncedFileName?: string;
}

export interface SyncSummary {
  totalSmartAdvocateDocuments: number;
  totalSyncedDocuments: number;
  totalUnsyncedDocuments: number;
  syncPercentage: number;
  lastSyncCheck: string;
}
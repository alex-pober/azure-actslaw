import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import { useSmartAdvocate } from '@/contexts/SmartAdvocateContext';
import { 
  getSmartAdvocateDocuments, 
  analyzeDocumentSync, 
  generateSyncSummary,
  DocumentSyncError 
} from '@/utils/documentSync';
import type { 
  SmartAdvocateDocument, 
  DocumentSyncStatus as DocumentSyncStatusType, 
  SyncSummary 
} from '@/types/document';

interface DocumentSyncStatusProps {
  caseId: string;
  caseNumber: string;
}

export default function DocumentSyncStatus({ caseId, caseNumber }: DocumentSyncStatusProps) {
  const { bearerToken, handleTokenExpired } = useSmartAdvocate();
  const [, setDocuments] = useState<SmartAdvocateDocument[]>([]);
  const [syncStatuses, setSyncStatuses] = useState<DocumentSyncStatusType[]>([]);
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const fetchDocumentSync = async (showLoadingSpinner = true) => {
    if (!bearerToken) return;

    if (showLoadingSpinner) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      // Fetch SmartAdvocate documents
      const saDocuments = await getSmartAdvocateDocuments(
        caseId, 
        bearerToken, 
        handleTokenExpired
      );
      
      setDocuments(saDocuments);

      // Analyze sync status with Azure blob storage
      const syncStatuses = await analyzeDocumentSync(saDocuments, caseNumber);
      setSyncStatuses(syncStatuses);

      // Generate summary
      const summary = generateSyncSummary(syncStatuses);
      setSyncSummary(summary);

    } catch (err) {
      console.error('Error fetching document sync status:', err);
      if (err instanceof DocumentSyncError) {
        setError(err.message);
      } else {
        setError('Failed to fetch document sync status');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocumentSync();
  }, [caseId, bearerToken]);

  const handleRefresh = () => {
    fetchDocumentSync(false);
  };

  const getSyncStatusIcon = (isSynced: boolean) => {
    return isSynced ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getSyncStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Azure Storage Sync Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking sync status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudOff className="h-5 w-5 text-red-600" />
            <span>Azure Storage Sync Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 font-medium mb-2">Sync Check Failed</p>
              <p className="text-sm text-slate-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!syncSummary) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Cloud className="h-5 w-5" />
            <span>Azure Storage Sync Status</span>
          </CardTitle>
          <Button 
            onClick={handleRefresh} 
            variant="ghost" 
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Sync Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {syncSummary.totalSmartAdvocateDocuments}
            </div>
            <div className="text-sm text-slate-600">Total Documents</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {syncSummary.totalSyncedDocuments}
            </div>
            <div className="text-sm text-slate-600">Synced</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {syncSummary.totalUnsyncedDocuments}
            </div>
            <div className="text-sm text-slate-600">Not Synced</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getSyncStatusColor(syncSummary.syncPercentage).split(' ')[0]}`}>
              {syncSummary.syncPercentage}%
            </div>
            <div className="text-sm text-slate-600">Sync Rate</div>
          </div>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={getSyncStatusColor(syncSummary.syncPercentage)}>
            {syncSummary.syncPercentage >= 90 ? 'Excellent Sync' :
             syncSummary.syncPercentage >= 70 ? 'Good Sync' : 'Needs Attention'}
          </Badge>
          <Button 
            onClick={() => setShowDetails(!showDetails)} 
            variant="outline" 
            size="sm"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>

        {/* Detailed Document List */}
        {showDetails && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-slate-900 mb-3 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Document Details ({syncStatuses.length})
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {syncStatuses.map((status) => (
                <div 
                  key={status.smartAdvocateDocument.documentID}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {status.smartAdvocateDocument.documentName}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {status.smartAdvocateDocument.categoryName} → {status.smartAdvocateDocument.subCategoryName}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    {getSyncStatusIcon(status.isSynced)}
                    <span className={`text-xs ${status.isSynced ? 'text-green-600' : 'text-red-600'}`}>
                      {status.isSynced ? 'Synced' : 'Missing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="mt-4 pt-4 border-t text-xs text-slate-500 text-center">
          Last checked: {new Date(syncSummary.lastSyncCheck).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}
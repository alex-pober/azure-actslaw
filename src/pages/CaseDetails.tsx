import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Building2, FileText, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { useCaseContext, type CaseInfo } from '@/contexts/CaseContext';
import { useSmartAdvocate } from '@/contexts/SmartAdvocateContext';
import { getCaseById, TokenExpiredError } from '@/utils/smartAdvocateApi';
import DocumentSyncStatus from '@/components/DocumentSyncStatus';

export default function CaseDetails() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { selectedCase, selectCase, isSearching } = useCaseContext();
  const { bearerToken, isConnected, handleTokenExpired } = useSmartAdvocate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we don't have a selected case but have a caseId in URL, fetch the case
    if (caseId && (!selectedCase || selectedCase.caseID.toString() !== caseId)) {
      if (!isConnected || !bearerToken) {
        setError('SmartAdvocate connection required to view case details');
        return;
      }

      fetchCaseById(caseId);
    }
  }, [caseId, selectedCase, isConnected, bearerToken]);

  const fetchCaseById = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const caseData: CaseInfo = await getCaseById(id, {
        bearerToken: bearerToken!,
        onTokenExpired: handleTokenExpired,
      });
      selectCase(caseData);
    } catch (err) {
      console.error('Error fetching case:', err);
      if (err instanceof TokenExpiredError) {
        setError('Your SmartAdvocate session has expired. Please sign in again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch case details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/home');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('settled') || lowerStatus.includes('closed')) return 'bg-green-100 text-green-800';
    if (lowerStatus.includes('active') || lowerStatus.includes('open')) return 'bg-blue-100 text-blue-800';
    if (lowerStatus.includes('pending')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">SmartAdvocate Connection Required</h1>
          <p className="text-slate-600 mb-6">Please connect to SmartAdvocate to view case details.</p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || isSearching) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900">Loading case details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Case</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedCase) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Case Not Found</h1>
          <p className="text-slate-600 mb-6">The requested case could not be found.</p>
          <Button onClick={handleGoBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Button onClick={handleGoBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">
                Case #{selectedCase.caseNumber}
              </h1>
              <Badge className={getStatusColor(selectedCase.caseStatus)}>
                {selectedCase.caseStatus}
              </Badge>
            </div>
            <h2 className="text-xl text-slate-600 mb-4">{selectedCase.caseName}</h2>
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <div className="flex items-center space-x-1">
                <Building2 className="h-4 w-4" />
                <span>{selectedCase.officeName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Opened: {formatDate(selectedCase.caseOpenedDate)}</span>
              </div>
            </div>
          </div>
          
          {/* Chat Button */}
          <Button 
            onClick={() => navigate(`/case/${selectedCase.caseID}/chat`)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat with AI
          </Button>
        </div>
      </div>

      {/* Additional Details */}
      {selectedCase.incident.mergedFacts && (
        <Card>
          <CardHeader>
            <CardTitle>Merged Facts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-900 leading-relaxed">{selectedCase.incident.mergedFacts}</p>
          </CardContent>
        </Card>
      )}

      {/* Document Sync Status */}
      <DocumentSyncStatus caseId={selectedCase.caseID.toString()} caseNumber={selectedCase.caseNumber} />
    </div>
  );
}

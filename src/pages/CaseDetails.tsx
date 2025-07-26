import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Building2, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { useCaseContext, type CaseInfo } from '@/contexts/CaseContext';
import { useSmartAdvocate } from '@/contexts/SmartAdvocateContext';

export default function CaseDetails() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { selectedCase, selectCase, isSearching } = useCaseContext();
  const { bearerToken, isConnected } = useSmartAdvocate();
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
      const apiUrl = import.meta.env.VITE_SMARTADVOCATE_API_URL || 'https://sa.actslaw.com/CaseSyncAPI';
      const response = await fetch(`${apiUrl}/case/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError(`Case with ID ${id} not found`);
          return;
        }
        throw new Error(`Failed to fetch case: ${response.statusText}`);
      }

      const caseData: CaseInfo = await response.json();
      selectCase(caseData);
    } catch (err) {
      console.error('Error fetching case:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch case details');
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
        </div>
      </div>

      {/* Case Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Case Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Case Type</label>
              <p className="text-slate-900">{selectedCase.caseType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Case Group</label>
              <p className="text-slate-900">{selectedCase.caseGroup}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Status From</label>
              <p className="text-slate-900">{formatDate(selectedCase.caseStatusFrom)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Office</label>
              <p className="text-slate-900">{selectedCase.officeName}</p>
            </div>
          </CardContent>
        </Card>

        {/* Incident Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Incident Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Incident Date</label>
              <p className="text-slate-900">{formatDate(selectedCase.incident.incidentDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">State</label>
              <p className="text-slate-900">{selectedCase.incident.state || 'N/A'}</p>
            </div>
            {selectedCase.incident.incidentFacts && (
              <div>
                <label className="text-sm font-medium text-slate-600">Incident Facts</label>
                <p className="text-slate-900 text-sm leading-relaxed">
                  {selectedCase.incident.incidentFacts}
                </p>
              </div>
            )}
            {selectedCase.incident.comments && (
              <div>
                <label className="text-sm font-medium text-slate-600">Comments</label>
                <p className="text-slate-900 text-sm leading-relaxed">
                  {selectedCase.incident.comments}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
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
    </div>
  );
}

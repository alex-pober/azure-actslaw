import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface CaseIncident {
  incidentDate: string;
  incidentFacts: string;
  mergedFacts: string;
  comments: string;
  state: string;
}

export interface CaseInfo {
  caseID: number;
  caseNumber: string;
  caseName: string;
  caseGroupID: number;
  caseGroup: string;
  caseTypeID: number;
  caseType: string;
  caseStatusID: number;
  caseStatus: string;
  caseStatusFrom: string;
  caseOpenedDate: string;
  officeID: number;
  officeName: string;
  incident: CaseIncident;
}

interface CaseContextType {
  selectedCase: CaseInfo | null;
  searchResults: CaseInfo[];
  isSearching: boolean;
  searchCase: (caseNumber: string, bearerToken: string) => Promise<void>;
  selectCase: (caseInfo: CaseInfo) => void;
  clearCase: () => void;
  clearSearchResults: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export function useCaseContext() {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
}

interface CaseProviderProps {
  children: ReactNode;
}

export function CaseProvider({ children }: CaseProviderProps) {
  const [selectedCase, setSelectedCase] = useState<CaseInfo | null>(null);
  const [searchResults, setSearchResults] = useState<CaseInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchCase = useCallback(async (caseNumber: string, bearerToken: string) => {
    if (!caseNumber.trim() || !bearerToken) return;

    setIsSearching(true);
    try {
      const apiUrl = import.meta.env.VITE_SMARTADVOCATE_API_URL || 'https://sa.actslaw.com/CaseSyncAPI';
      const response = await fetch(`${apiUrl}/case/CaseInfo?Casenumber=${encodeURIComponent(caseNumber)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const cases: CaseInfo[] = await response.json();
      setSearchResults(cases);
    } catch (error) {
      console.error('Error searching cases:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const selectCase = useCallback((caseInfo: CaseInfo) => {
    setSelectedCase(caseInfo);
    setSearchResults([]);
  }, []);

  const clearCase = useCallback(() => {
    setSelectedCase(null);
  }, []);

  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  const value: CaseContextType = {
    selectedCase,
    searchResults,
    isSearching,
    searchCase,
    selectCase,
    clearCase,
    clearSearchResults,
  };

  return (
    <CaseContext.Provider value={value}>
      {children}
    </CaseContext.Provider>
  );
}
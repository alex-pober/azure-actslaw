import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { searchCases, TokenExpiredError } from '../utils/smartAdvocateApi';

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
  searchCase: (caseNumber: string, bearerToken: string, onTokenExpired?: () => void) => Promise<void>;
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

  const searchCase = useCallback(async (caseNumber: string, bearerToken: string, onTokenExpired?: () => void) => {
    if (!caseNumber.trim() || !bearerToken) return;

    setIsSearching(true);
    try {
      const cases: CaseInfo[] = await searchCases(caseNumber, {
        bearerToken,
        onTokenExpired,
      });
      setSearchResults(cases);
    } catch (error) {
      console.error('Error searching cases:', error);
      if (error instanceof TokenExpiredError) {
        // Don't set search results if token expired
        setSearchResults([]);
      } else {
        setSearchResults([]);
      }
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
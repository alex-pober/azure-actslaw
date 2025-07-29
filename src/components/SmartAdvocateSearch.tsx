import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, FileText, Loader2 } from 'lucide-react';
import { useCaseContext, type CaseInfo } from '@/contexts/CaseContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSmartAdvocate } from '@/contexts/SmartAdvocateContext';

interface SmartAdvocateSearchProps {
  bearerToken: string;
}

export default function SmartAdvocateSearch({ bearerToken }: SmartAdvocateSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { handleTokenExpired } = useSmartAdvocate();
  
  const { selectedCase, searchResults, isSearching, searchCase, selectCase, clearCase, clearSearchResults } = useCaseContext();
  
  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Perform search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm && !selectedCase) {
      searchCase(debouncedSearchTerm, bearerToken, handleTokenExpired);
      setIsDropdownOpen(true);
    } else if (!debouncedSearchTerm) {
      clearSearchResults();
      setIsDropdownOpen(false);
    }
  }, [debouncedSearchTerm, bearerToken, searchCase, clearSearchResults, selectedCase, handleTokenExpired]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCaseSelect = (caseInfo: CaseInfo) => {
    selectCase(caseInfo);
    setSearchTerm('');
    setIsDropdownOpen(false);
    // Navigate to the case details page
    navigate(`/case/${caseInfo.caseID}`);
  };

  const handleClearCase = () => {
    clearCase();
    setSearchTerm('');
    setIsDropdownOpen(false);
    // If we're currently on a case page, navigate back to home
    if (window.location.pathname.startsWith('/case/')) {
      navigate('/home');
    }
  };

  if (selectedCase) {
    return (
      <div className="flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-2 max-w-md">
        <FileText className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
        <button
          onClick={() => navigate(`/case/${selectedCase.caseID}`)}
          className="flex-1 min-w-0 text-left hover:bg-green-100/50 rounded px-1 py-1 transition-colors"
          title="View case details"
        >
          <div className="text-sm font-medium text-green-900 truncate">
            {selectedCase.caseNumber}
          </div>
          <div className="text-xs text-green-700 truncate">
            {selectedCase.caseName}
          </div>
        </button>
        <button
          onClick={handleClearCase}
          className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded flex-shrink-0"
          title="Clear selected case"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div ref={searchRef} className="relative max-w-md w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search SmartAdvocate cases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      {isDropdownOpen && (searchResults.length > 0 || isSearching) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isSearching && (
            <div className="p-3 text-center text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
              Searching cases...
            </div>
          )}
          
          {!isSearching && searchResults.length === 0 && debouncedSearchTerm && (
            <div className="p-3 text-center text-sm text-slate-500">
              No cases found for "{debouncedSearchTerm}"
            </div>
          )}

          {searchResults.map((caseInfo) => (
            <button
              key={caseInfo.caseID}
              onClick={() => handleCaseSelect(caseInfo)}
              className="w-full p-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0 focus:bg-slate-50 focus:outline-none"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-slate-900">
                      {caseInfo.caseNumber}
                    </span>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {caseInfo.caseStatus}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 truncate mb-1">
                    {caseInfo.caseName}
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span>{caseInfo.caseType}</span>
                    <span>{caseInfo.officeName}</span>
                    <span>{new Date(caseInfo.caseOpenedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
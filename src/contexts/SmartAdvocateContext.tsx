import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useMsal } from '@azure/msal-react';

interface SmartAdvocateContextType {
  bearerToken: string | null;
  isConnected: boolean;
  setBearerToken: (token: string | null) => void;
}

const SmartAdvocateContext = createContext<SmartAdvocateContextType | undefined>(undefined);

export function useSmartAdvocate() {
  const context = useContext(SmartAdvocateContext);
  if (context === undefined) {
    throw new Error('useSmartAdvocate must be used within a SmartAdvocateProvider');
  }
  return context;
}

interface SmartAdvocateProviderProps {
  children: ReactNode;
}

export function SmartAdvocateProvider({ children }: SmartAdvocateProviderProps) {
  const { accounts } = useMsal();
  const [bearerToken, setBearerTokenState] = useState<string | null>(null);

  // Token storage functions using localStorage
  const getStorageKey = useCallback(() => 
    `sa-token-${accounts[0]?.username?.replace(/[^a-zA-Z0-9]/g, '-')}`, 
    [accounts]
  );
  
  const getStoredToken = useCallback((): string | null => {
    try {
      return localStorage.getItem(getStorageKey());
    } catch (error) {
      console.error('Failed to retrieve token:', error);
      return null;
    }
  }, [getStorageKey]);

  const setBearerToken = useCallback((token: string | null) => {
    setBearerTokenState(token);
    
    try {
      if (token) {
        localStorage.setItem(getStorageKey(), token);
      } else {
        localStorage.removeItem(getStorageKey());
      }
    } catch (error) {
      console.error('Failed to store/remove token:', error);
    }
  }, [getStorageKey]);

  // Load token on mount
  useEffect(() => {
    if (accounts.length > 0) {
      const storedToken = getStoredToken();
      if (storedToken) {
        setBearerTokenState(storedToken);
      }
    }
  }, [accounts, getStoredToken]);

  const value: SmartAdvocateContextType = {
    bearerToken,
    isConnected: !!bearerToken,
    setBearerToken,
  };

  return (
    <SmartAdvocateContext.Provider value={value}>
      {children}
    </SmartAdvocateContext.Provider>
  );
}
// Utility for handling SmartAdvocate API calls with token expiration
export class TokenExpiredError extends Error {
  constructor(message: string = 'SmartAdvocate token has expired') {
    super(message);
    this.name = 'TokenExpiredError';
  }
}

export interface SmartAdvocateApiOptions {
  bearerToken: string;
  onTokenExpired?: () => void;
}

export async function makeSmartAdvocateRequest(
  url: string, 
  options: SmartAdvocateApiOptions,
  fetchOptions?: RequestInit
): Promise<Response> {
  const apiUrl = import.meta.env.VITE_SMARTADVOCATE_API_URL || 'https://sa.actslaw.com/CaseSyncAPI';
  
  const response = await fetch(`${apiUrl}${url}`, {
    ...fetchOptions,
    headers: {
      'Authorization': `Bearer ${options.bearerToken}`,
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
  });

  // Handle token expiration
  if (response.status === 401 || response.status === 403) {
    // Call the token expired callback if provided
    if (options.onTokenExpired) {
      options.onTokenExpired();
    }
    throw new TokenExpiredError('Your SmartAdvocate session has expired. Please sign in again.');
  }

  return response;
}

export async function searchCases(
  caseNumber: string, 
  options: SmartAdvocateApiOptions
): Promise<any[]> {
  const response = await makeSmartAdvocateRequest(
    `/case/CaseInfo?Casenumber=${encodeURIComponent(caseNumber)}`,
    options,
    { method: 'GET' }
  );

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getCaseById(
  caseId: string, 
  options: SmartAdvocateApiOptions
): Promise<any> {
  const response = await makeSmartAdvocateRequest(
    `/case/${encodeURIComponent(caseId)}`,
    options,
    { method: 'GET' }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Case with ID ${caseId} not found`);
    }
    throw new Error(`Failed to fetch case: ${response.statusText}`);
  }

  return response.json();
}
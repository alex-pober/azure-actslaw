import type { IPublicClientApplication } from '@azure/msal-browser';
import type { ChatMessage, StreamingChatResponse, ChatSource } from '../types/chat';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const BACKEND_CLIENT_ID = import.meta.env.VITE_BACKEND_CLIENT_ID;

// Get JWT token for API authentication
async function getAccessToken(msalInstance: IPublicClientApplication): Promise<string | null> {
  try {
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const account = accounts[0];
    const silentRequest = {
      scopes: [`${BACKEND_CLIENT_ID}/.default`],
      account: account,
    };

    try {
      const response = await msalInstance.acquireTokenSilent(silentRequest);
      return response.accessToken;
    } catch (silentError: unknown) {
      // If silent acquisition fails due to consent required, try interactive
      const error = silentError as { errorCode?: string; message?: string };
      if (error.errorCode === 'consent_required' || 
          error.errorCode === 'interaction_required' ||
          error.message?.includes('consent')) {
        console.log('Consent required, attempting interactive login...');
        
        const interactiveRequest = {
          scopes: [`${BACKEND_CLIENT_ID}/.default`],
          account: account,
        };
        
        const response = await msalInstance.acquireTokenPopup(interactiveRequest);
        return response.accessToken;
      }
      throw silentError;
    }
  } catch (error) {
    console.error('Failed to acquire token:', error);
    return null;
  }
}

export async function* streamChatCompletion(
  messages: ChatMessage[],
  caseNumber: string,
  msalInstance: IPublicClientApplication
): AsyncGenerator<StreamingChatResponse, void, unknown> {
  try {
    const accessToken = await getAccessToken(msalInstance);
    if (!accessToken) {
      throw new Error('Failed to acquire access token');
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        caseNumber
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let sources: ChatSource[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'sources') {
                if (data.isFirstChunk) {
                  sources = data.sources || [];
                } else {
                  sources = [...sources, ...(data.sources || [])];
                }
              } else if (data.type === 'content') {
                accumulatedContent += data.content;
                yield {
                  content: accumulatedContent,
                  sources,
                  isComplete: false
                };
              } else if (data.type === 'complete') {
                yield {
                  content: accumulatedContent,
                  sources,
                  isComplete: true
                };
                return;
              }
            } catch {
              console.warn('Failed to parse SSE data:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

  } catch (error) {
    console.error('Error in streamChatCompletion:', error);
    throw error;
  }
}

export async function sendMessage(
  messages: ChatMessage[],
  caseNumber: string,
  msalInstance: IPublicClientApplication
): Promise<{ content: string; sources: ChatSource[] }> {
  let finalContent = '';
  let finalSources: ChatSource[] = [];

  for await (const response of streamChatCompletion(messages, caseNumber, msalInstance)) {
    finalContent = response.content;
    finalSources = response.sources;
    if (response.isComplete) break;
  }

  return {
    content: finalContent,
    sources: finalSources
  };
}

// Test connection function
export async function testConnection(msalInstance: IPublicClientApplication): Promise<boolean> {
  try {
    const accessToken = await getAccessToken(msalInstance);
    if (!accessToken) {
      throw new Error('Failed to acquire access token');
    }

    const response = await fetch(`${API_BASE_URL}/api/test-connection`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });
    const data = await response.json();
    return data.success || false;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
}

// Export an object that matches the previous class interface for backward compatibility
export const azureOpenAIChat = {
  streamChatCompletion,
  sendMessage,
  testConnection
};

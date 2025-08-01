import type { ChatMessage, StreamingChatResponse, ChatSource } from '../types/chat';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function* streamChatCompletion(
  messages: ChatMessage[],
  caseNumber: string
): AsyncGenerator<StreamingChatResponse, void, unknown> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
              yield {
                content: data.content,
                sources: data.sources || [],
                isComplete: data.isComplete || false
              };

              if (data.isComplete) {
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
  caseNumber: string
): Promise<{ content: string; sources: ChatSource[] }> {
  let finalContent = '';
  let finalSources: ChatSource[] = [];

  for await (const response of streamChatCompletion(messages, caseNumber)) {
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
export async function testConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/test-connection`);
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

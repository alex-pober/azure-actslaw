export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: ChatSource[];
}

export interface ChatSource {
  title: string;
  content: string;
  url?: string;
  score?: number;
}

export interface ChatSession {
  id: string;
  caseId: string;
  caseNumber: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface StreamingChatResponse {
  content: string;
  sources: ChatSource[];
  isComplete: boolean;
}
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useMsal } from '@azure/msal-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Send,
  MessageSquare,
  FileText,
  Loader2,
  User,
  Bot,
  ExternalLink
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useCaseContext } from '@/contexts/CaseContext';
import { useSmartAdvocate } from '@/contexts/SmartAdvocateContext';
import { getCaseById } from '@/utils/smartAdvocateApi';
import { azureOpenAIChat } from '@/utils/azureOpenAI';
import type { ChatMessage, ChatSource } from '@/types/chat';

export default function CaseChat() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { instance: msalInstance } = useMsal();
  const { selectedCase, selectCase } = useCaseContext();
  const { bearerToken, isConnected, handleTokenExpired } = useSmartAdvocate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamingResponse, setIsStreamingResponse] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch case if not already selected
  useEffect(() => {
    const fetchCaseIfNeeded = async () => {
      if (caseId && (!selectedCase || selectedCase.caseID.toString() !== caseId)) {
        if (!isConnected || !bearerToken) {
          navigate(`/case/${caseId}`);
          return;
        }

        setIsLoading(true);
        try {
          const caseData = await getCaseById(caseId, {
            bearerToken,
            onTokenExpired: handleTokenExpired,
          });
          selectCase(caseData);
        } catch (err) {
          console.error('Error fetching case:', err);
          setError('Failed to load case information');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCaseIfNeeded();
  }, [caseId, selectedCase, isConnected, bearerToken, navigate, handleTokenExpired, selectCase]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isStreamingResponse || !selectedCase) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsStreamingResponse(true);
    setStreamingContent('');
    setError(null);

    try {
      const assistantMessageId = (Date.now() + 1).toString();
      let finalContent = '';
      let sources: ChatSource[] = [];

      // Stream the response
      for await (const response of azureOpenAIChat.streamChatCompletion(
        [...messages, userMessage],
        selectedCase.caseNumber,
        msalInstance
      )) {
        finalContent = response.content;
        sources = response.sources;
        setStreamingContent(response.content);

        if (response.isComplete) {
          break;
        }
      }

      // Add the complete assistant message
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: finalContent,
        timestamp: new Date().toISOString(),
        sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStreamingContent('');

    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsStreamingResponse(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGoBack = () => {
    navigate(`/case/${caseId}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-900">Loading case information...</h2>
        </div>
      </div>
    );
  }

  if (!selectedCase) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Case Not Found</h1>
          <p className="text-slate-600 mb-6">The requested case could not be found.</p>
          <Button onClick={() => navigate('/home')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 h-screen flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <Button onClick={handleGoBack} variant="outline" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Case Details
        </Button>

        <div className="flex items-center space-x-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Case Chat - #{selectedCase.caseNumber}
            </h1>
            <p className="text-slate-600">{selectedCase.caseName}</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>AI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Bot className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>Start a conversation about this case. I can help you analyze documents, find information, and answer questions.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-3xl w-full ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`rounded-lg p-3 break-words overflow-wrap-anywhere ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-900'
                    }`}>
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none break-words">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-xs font-medium mb-2 text-slate-600">Sources:</p>
                          <div className="space-y-1">
                            {message.sources.map((source, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs">
                                <FileText className="h-3 w-3" />
                                <span className="truncate">{source.title}</span>
                                {source.url && (
                                  <ExternalLink className="h-3 w-3 cursor-pointer"
                                    onClick={() => window.open(source.url, '_blank')} />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming Response */}
            {isStreamingResponse && (
              <div className="flex justify-start">
                <div className="max-w-3xl w-full">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-slate-100 text-slate-900 rounded-lg p-3 break-words overflow-wrap-anywhere">
                      <div className="prose prose-sm max-w-none break-words">
                        <ReactMarkdown>{streamingContent}</ReactMarkdown>
                        <span className="inline-block w-2 h-4 bg-slate-400 ml-1 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Message Input */}
          <div className="flex space-x-2">
            <textarea
              ref={textareaRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me about this case..."
              className="flex-1 resize-none border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={isStreamingResponse}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isStreamingResponse}
              className="px-4"
            >
              {isStreamingResponse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

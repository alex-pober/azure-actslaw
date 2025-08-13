import express from 'express';
import cors from 'cors';
import { AzureOpenAI } from 'openai';
import { SearchClient, SearchIndexClient } from '@azure/search-documents';
import { AzureKeyCredential } from '@azure/core-auth';
import { expressjwt as jwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Azure configuration
const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_API_KEY = process.env.AZURE_OPENAI_API_KEY;
const AZURE_OPENAI_DEPLOYMENT_ID = process.env.AZURE_OPENAI_DEPLOYMENT_ID;
const AZURE_AI_SEARCH_ENDPOINT = process.env.AZURE_AI_SEARCH_ENDPOINT;
const AZURE_AI_SEARCH_API_KEY = process.env.AZURE_AI_SEARCH_API_KEY;
const AZURE_AI_SEARCH_INDEX = process.env.AZURE_AI_SEARCH_INDEX;

// Azure AD configuration for JWT validation
const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
const BACKEND_CLIENT_ID = process.env.BACKEND_CLIENT_ID;
const FRONTEND_CLIENT_ID = process.env.FRONTEND_CLIENT_ID;

// Server configuration
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Validate configuration
if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_API_KEY || !AZURE_OPENAI_DEPLOYMENT_ID) {
  console.error("Please set the required Azure OpenAI environment variables");
  process.exit(1);
}

if (!AZURE_AI_SEARCH_ENDPOINT || !AZURE_AI_SEARCH_API_KEY || !AZURE_AI_SEARCH_INDEX) {
  console.warn('Azure AI Search is not fully configured. RAG functionality will be limited.');
}

if (!AZURE_TENANT_ID || !BACKEND_CLIENT_ID || !FRONTEND_CLIENT_ID) {
  console.error("Please set the required Azure AD environment variables for JWT validation");
  process.exit(1);
}

// Initialize clients
const openaiClient = new AzureOpenAI({
  endpoint: AZURE_OPENAI_ENDPOINT,
  apiKey: AZURE_OPENAI_API_KEY,
  apiVersion: "2024-10-21"
});

let searchClient = null;
let searchIndexClient = null;

if (AZURE_AI_SEARCH_ENDPOINT && AZURE_AI_SEARCH_API_KEY && AZURE_AI_SEARCH_INDEX) {
  try {
    // Use proper AzureKeyCredential for API key authentication
    searchClient = new SearchClient(
      AZURE_AI_SEARCH_ENDPOINT,
      AZURE_AI_SEARCH_INDEX,
      new AzureKeyCredential(AZURE_AI_SEARCH_API_KEY)
    );

    searchIndexClient = new SearchIndexClient(
      AZURE_AI_SEARCH_ENDPOINT,
      new AzureKeyCredential(AZURE_AI_SEARCH_API_KEY)
    );

    console.log(`Search client initialized for index: ${AZURE_AI_SEARCH_INDEX}`);

    // Get and log the index schema to understand available fields
    try {
      const index = await searchIndexClient.getIndex(AZURE_AI_SEARCH_INDEX);
      console.log('Available fields in index:');
      index.fields.forEach(field => {
        console.log(`- ${field.name} (${field.type}) - searchable: ${field.searchable}, retrievable: ${field.retrievable}`);
      });
    } catch (schemaError) {
      console.warn('Could not retrieve index schema:', schemaError.message);
    }

  } catch (error) {
    console.error('Failed to initialize search client:', error.message);
  }
}

// JWT middleware configuration
const jwtMiddleware = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`
  }),
  audience: [BACKEND_CLIENT_ID, `api://${BACKEND_CLIENT_ID}`],
  issuer: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`,
  algorithms: ['RS256']
});

// Custom middleware to validate the frontend client ID
const validateFrontendClient = (req, res, next) => {
  try {
    const token = req.auth;

    // Check if the token contains the authorized party (azp) or appid that matches the frontend
    const authorizedParty = token.azp || token.appid;

    if (authorizedParty !== FRONTEND_CLIENT_ID) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid client application'
      });
    }

    next();
  } catch (error) {
    console.error('Frontend client validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Token validation failed'
    });
  }
};

// Simple RAG query function - let the index return what it finds
async function queryAISearchForSources(query) {
  if (!searchClient) {
    return [];
  }

  try {
    // Simple search - let the index do its job
    const searchOptions = {
      top: 15,
      searchMode: "any"
    };

    console.log(`Searching for: "${query}"`);
    const searchResults = await searchClient.search(query, searchOptions);

    const sources = [];
    for await (const result of searchResults.results) {
      // Just take whatever the index returns
      sources.push({
        score: result.score || 0,
        document: result.document
      });
    }

    console.log(`Found ${sources.length} results`);
    if (sources.length > 0) {
      console.log('Available fields in results:', Object.keys(sources[0].document));
    }

    return sources;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

// Query OpenAI with RAG context
async function queryOpenAIForResponse(messages, sources, caseNumber) {
  // Format sources for context - use whatever fields the index provides
  const sourceContext = sources.length > 0
    ? sources.map((source, index) => {
        // Convert the document to a readable format
        const doc = source.document;
        console.log(doc)
        const docText = Object.entries(doc)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
        return `Source ${index + 1} (Score: ${source.score}):\n${docText}`;
      }).join('\n\n')
    : '';

  // Build system message with context
  const systemMessage = {
    role: 'system',
    content: `You are a legal assistant.

Use the following sources to provide accurate, relevant information. Always cite your sources when providing information from documents. Be professional and precise in your responses.

Available Sources:
${sourceContext}

If the sources don't contain relevant information, say so clearly and provide general guidance where appropriate.`
  };

  const formattedMessages = [systemMessage, ...messages];

  const response = await openaiClient.chat.completions.create({
    model: AZURE_OPENAI_DEPLOYMENT_ID,
    messages: formattedMessages,
    max_tokens: 4000,
    temperature: 0.3,
    stream: true
  });

  // Return formatted sources for the frontend - exclude large fields like embeddings
  const formattedSources = sources.map(source => {
    const doc = source.document;
    // Create a clean copy without embedding fields and other large arrays
    const cleanDoc = {};
    for (const [key, value] of Object.entries(doc)) {
      // Skip embedding fields and other large arrays
      if (!key.includes('embedding') && !key.includes('vector') &&
          !(Array.isArray(value) && value.length > 50)) {
        cleanDoc[key] = value;
      }
    }

    return {
      title: doc.document_title || doc.filename || 'Document',
      content: JSON.stringify(cleanDoc, null, 2),
      url: doc.url || doc.path || '',
      score: source.score
    };
  });

  return { response, sources: formattedSources };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    searchConfigured: !!searchClient
  });
});

// Chat completion endpoint with RAG (protected)
app.post('/api/chat/completions', jwtMiddleware, validateFrontendClient, async (req, res) => {
  try {
    const { messages, caseNumber } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Get the latest user message for search
    const latestUserMessage = messages.filter(m => m.role === 'user').pop();
    const searchQuery = latestUserMessage?.content || '';

    // Step 1: Search for relevant sources - let the index find what's relevant
    const sources = await queryAISearchForSources(searchQuery);

    // Step 2: Query OpenAI with RAG context
    const { response: openaiResponse, sources: finalSources } = await queryOpenAIForResponse(
      messages.map(msg => ({ role: msg.role, content: msg.content })),
      sources,
      caseNumber
    );

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type'
    });

    let content = '';

    for await (const chunk of openaiResponse) {
      const choice = chunk.choices[0];

      if (choice?.delta?.content) {
        content += choice.delta.content;

        // Send streaming response
        res.write(`data: ${JSON.stringify({
          content,
          sources: finalSources,
          isComplete: false
        })}\n\n`);
      }
    }

    // Send final response
    res.write(`data: ${JSON.stringify({
      content,
      sources: finalSources,
      isComplete: true
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('Error in chat completion:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Test connection endpoint (protected)
app.get('/api/test-connection', jwtMiddleware, validateFrontendClient, async (req, res) => {
  try {
    const testMessages = [
      { role: 'user', content: 'Hello, can you help me?' }
    ];

    const response = await openaiClient.chat.completions.create({
      model: AZURE_OPENAI_DEPLOYMENT_ID,
      messages: testMessages,
      max_tokens: 10
    });

    res.json({
      success: response.choices.length > 0,
      message: 'Azure OpenAI connection successful',
      searchConfigured: !!searchClient
    });
  } catch (error) {
    console.error('Azure OpenAI connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API-only backend - no catch-all route needed

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Frontend URL (CORS): ${FRONTEND_URL}`);
  console.log(`Health check available at ${BASE_URL}/health`);
  console.log(`Chat API available at ${BASE_URL}/api/chat/completions`);
  console.log(`Test connection available at ${BASE_URL}/api/test-connection`);
  console.log(`Search configured: ${!!searchClient}`);
  console.log(`JWT validation enabled for tenant: ${AZURE_TENANT_ID}`);
});

# Azure Acts Law - Backend API

This backend server handles Azure OpenAI API calls to avoid CORS issues in the browser.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your Azure credentials:
```env
AZURE_OPENAI_ENDPOINT=https://your-openai-endpoint.openai.azure.com
AZURE_OPENAI_API_KEY=your-openai-api-key
AZURE_OPENAI_DEPLOYMENT_ID=gpt-4o
AZURE_AI_SEARCH_ENDPOINT=https://your-search-endpoint.search.windows.net
AZURE_AI_SEARCH_API_KEY=your-search-api-key
AZURE_AI_SEARCH_INDEX=your-search-index
PORT=3001
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/chat/completions` - Chat with Azure OpenAI (streaming)
- `GET /api/test-connection` - Test Azure OpenAI connection

## Frontend Configuration

Update your frontend `.env` to point to this backend:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Architecture

```
Frontend (React) -> Backend API (Node.js/Express) -> Azure OpenAI + Azure AI Search
```

This setup:
- ✅ Avoids CORS issues
- ✅ Keeps Azure API keys secure on the backend
- ✅ Supports streaming responses via Server-Sent Events
- ✅ Integrates with Azure AI Search for RAG functionality
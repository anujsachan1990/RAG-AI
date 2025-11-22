# Hesta AI - RAG-Powered Chat Assistant

A Next.js application that uses RAG (Retrieval Augmented Generation) with Upstash Vector to provide accurate information about Hesta superannuation fund.

## Features

- 🤖 AI-powered chat interface using Claude Sonnet 4
- 🔍 RAG implementation with Upstash Vector database
- 📚 Retrieves real-time information from hesta.com.au
- ⚡ Fast semantic search with vector embeddings
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 💰 No OpenAI API key required - Upstash handles embeddings
- 🔄 Toggle RAG on/off with environment variable

## Setup

### 1. Create Upstash Vector Index

Go to [Upstash Console](https://console.upstash.com) and create a new Vector index:

- **Name:** hesta-rag (or your preferred name)
- **Region:** Choose your preferred region
- **Type:** Hybrid (recommended)
- **Dense Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2` (recommended)
- **Sparse Embedding Model:** `BM25` (recommended)
- **Metric:** COSINE
  
⚠️ **Important:** The index MUST be created WITH an embedding model. This allows Upstash to automatically generate embeddings from text without requiring an OpenAI API key.

### 2. Environment Variables

Add the following to your `.env.local`:

\`\`\`env
THESYS_API_KEY=your-thesys-api-key
UPSTASH_VECTOR_REST_URL=your-upstash-vector-url
UPSTASH_VECTOR_REST_TOKEN=your-upstash-vector-token
ENABLE_RAG=true
\`\`\`

**RAG Toggle:** Set `ENABLE_RAG=false` to disable RAG and use pure LLM responses for comparison.

### 3. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 4. Index Hesta Content

Before using the chat, scrape and index content from hesta.com.au:

\`\`\`bash
npm run index-hesta
\`\`\`

This will:
- Scrape content from key Hesta pages
- Split content into searchable chunks
- Send to Upstash (which generates embeddings automatically)
- Takes ~2-3 minutes to complete

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Troubleshooting

### RAG Not Returning Accurate Information

If the RAG system is retrieving documents but providing generic answers:

1. **Check retrieved content** - Look at debug logs to see what content is being retrieved
2. **Re-index content** - The initial scraping may have only captured navigation elements
3. **Use improved indexing** - The updated script filters out headers/footers and focuses on main content

See `RAG_SETUP.md` for detailed troubleshooting guide.

### Content Extraction Issues

Most modern websites load content dynamically with JavaScript. Basic HTML scraping may only capture:
- Navigation menus
- Page headers
- Basic structure

**Solutions:**
- Re-run indexing with the improved script (filters navigation elements)
- For JavaScript-rendered content (tables, dynamic data), consider using Puppeteer

See `RAG_SETUP.md` for implementation details.

## Architecture

- **Frontend:** Next.js 16 with App Router, React 19, Tailwind CSS v4
- **AI:** Claude Sonnet 4 via Vercel AI SDK
- **Vector Database:** Upstash Vector with hybrid search (dense + sparse)
- **RAG Implementation:** Custom retrieval with semantic search and keyword matching

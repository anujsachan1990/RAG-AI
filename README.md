# RAG Chat Framework

A customizable, production-ready RAG (Retrieval-Augmented Generation) chat application built with Next.js, TypeScript, and AI SDK. Originally built for HESTA, now a reusable framework for any organization.

## Features

- 🎨 **Fully Customizable Branding** - Logo, colors, and messaging
- 🔍 **Built-in RAG System** - Retrieves context from your website using Upstash Vector
- 💬 **Streaming AI Chat** - Real-time responses using AI SDK
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast & Modern** - Built with Next.js 16 and React 19
- 🎯 **TypeScript** - Full type safety
- 💰 **No OpenAI Key Required** - Upstash handles embeddings automatically

## Quick Start

### 1. Clone & Install

\`\`\`bash
git clone <your-repo>
cd rag-chat-framework
npm install
\`\`\`

### 2. Configure Your Brand

Open `lib/framework-config.ts` and customize:

\`\`\`typescript
export const frameworkConfig = {
  branding: {
    name: "Your App Name",
    tagline: "Your Tagline",
    description: "Your description",
    logoUrl: "https://your-logo-url.com/logo.png",
    disclaimerText: "Your disclaimer text",
  },
  
  landingPage: {
    placeholderText: "Ask me anything...",
    suggestions: [
      "Your question 1",
      "Your question 2",
      "Your question 3",
    ],
  },
  
  rag: {
    baseDomain: "yourdomain.com",
    baseUrl: "https://www.yourdomain.com",
    pagesToIndex: [
      "https://www.yourdomain.com/page1",
      "https://www.yourdomain.com/page2",
    ],
  },
  
  theme: {
    colors: {
      primary: "#your-primary-color",
      accent: "#your-accent-color",
    },
  },
}
\`\`\`

### 3. Create Upstash Vector Index

Go to [Upstash Console](https://console.upstash.com) and create a new Vector index:

- **Name:** your-app-rag (or your preferred name)
- **Region:** Choose your preferred region
- **Type:** Hybrid (recommended)
- **Dense Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2` (recommended)
- **Sparse Embedding Model:** `BM25` (recommended)
- **Metric:** COSINE

⚠️ **Important:** The index MUST be created WITH an embedding model. This allows Upstash to automatically generate embeddings from text without requiring an OpenAI API key.

### 4. Set Environment Variables

Create a `.env.local` file:

\`\`\`env
# Required: Your AI API key
THESYS_API_KEY=your_api_key_here

# Required: Upstash Vector credentials
UPSTASH_VECTOR_REST_URL=your-upstash-vector-url
UPSTASH_VECTOR_REST_TOKEN=your-upstash-vector-token

# Optional: Override default model
AI_MODEL=c1/anthropic/claude-sonnet-4/v-20250915

# Optional: Disable RAG (default: true)
ENABLE_RAG=true
\`\`\`

### 5. Index Your Content

Before using the chat, scrape and index content from your website:

\`\`\`bash
npm run index-hesta
\`\`\`

This will:
- Scrape content from pages listed in your config
- Split content into searchable chunks
- Send to Upstash (which generates embeddings automatically)
- Takes ~2-3 minutes to complete

### 6. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Configuration Guide

### Branding Configuration

All branding options are in `lib/framework-config.ts`:

- `name` - Your application name
- `tagline` - Subtitle displayed in header
- `description` - Landing page description
- `logoUrl` - Logo image URL (used everywhere)
- `disclaimerText` - Footer disclaimer text

### Theme Configuration

Customize colors in the config:

\`\`\`typescript
theme: {
  colors: {
    primary: "#your-color",  // Main brand color
    accent: "#your-color",   // Hover/secondary color
  },
}
\`\`\`

For advanced theming, edit `app/globals.css` CSS variables.

### Landing Page Configuration

Customize the home screen:

\`\`\`typescript
landingPage: {
  placeholderText: "Your placeholder...",
  suggestions: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6"],
  suggestionsLabel: "Try asking:",
}
\`\`\`

### RAG Configuration

Configure what content to retrieve:

\`\`\`typescript
rag: {
  enabled: true,
  baseDomain: "yourdomain.com",
  baseUrl: "https://www.yourdomain.com",
  pagesToIndex: [
    // Add your important pages here
  ],
  maxResults: 5, // Number of results to retrieve
}
\`\`\`

### AI System Messages

Customize AI behavior by editing the system messages:

\`\`\`typescript
ai: {
  systemMessageWithRAG: (contextInfo) => `Your custom prompt...`,
  systemMessageWithoutRAG: `Your fallback prompt...`,
  noContentMessage: "Your no-content message...",
}
\`\`\`

### API Configuration

Change AI providers or models:

\`\`\`typescript
api: {
  defaultModel: "your-model-name",
  endpoint: "https://your-api-endpoint.com",
  apiKeyEnvVar: "YOUR_API_KEY_ENV_VAR",
}
\`\`\`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `THESYS_API_KEY` | Yes | Your AI API key |
| `UPSTASH_VECTOR_REST_URL` | Yes | Upstash Vector REST URL |
| `UPSTASH_VECTOR_REST_TOKEN` | Yes | Upstash Vector REST token |
| `ENABLE_RAG` | No | Enable/disable RAG (default: true) |
| `AI_MODEL` | No | Override default AI model |

## Project Structure

\`\`\`
├── app/
│   ├── api/chat/route.ts      # Chat API endpoint
│   ├── layout.tsx             # Root layout with metadata
│   ├── page.tsx               # Main page
│   └── globals.css            # Global styles
├── components/
│   ├── brand-icon.tsx         # Reusable logo component
│   ├── chat-interface.tsx     # Chat UI
│   ├── header.tsx             # App header
│   ├── landing-screen.tsx     # Home page
│   └── ui/                    # UI components
├── lib/
│   ├── framework-config.ts    # 🎯 Main configuration file
│   ├── rag-retriever.ts       # RAG retrieval logic
│   └── vector-store.ts        # Vector storage
└── README.md
\`\`\`

## Customization Checklist

- [ ] Update `frameworkConfig.branding` with your brand info
- [ ] Set your `logoUrl` in the config
- [ ] Customize theme colors (`primary` and `accent`)
- [ ] Add your landing page questions to `suggestions`
- [ ] Configure RAG `pagesToIndex` with your website URLs
- [ ] Update system messages in `ai` config
- [ ] Create Upstash Vector index
- [ ] Set environment variables
- [ ] Run indexing script
- [ ] Test with your content

## Troubleshooting

### "Billing threshold exceeded" Error

If you see an error about billing limits, your API key has reached its usage threshold. See [API_PROVIDERS.md](./API_PROVIDERS.md) for detailed instructions on:
- Updating your API key
- Switching to alternative AI providers (OpenAI, Anthropic, OpenRouter)
- Configuring different models and endpoints

### RAG Not Returning Accurate Information

If the RAG system is retrieving documents but providing generic answers:

1. **Check retrieved content** - Look at debug logs to see what content is being retrieved
2. **Re-index content** - The initial scraping may have only captured navigation elements
3. **Verify Upstash index** - Ensure your vector index was created with an embedding model

### Content Extraction Issues

Most modern websites load content dynamically with JavaScript. Basic HTML scraping may only capture navigation menus and page headers.

**Solutions:**
- Re-run indexing with improved script (filters navigation elements)
- For JavaScript-rendered content, consider using Puppeteer
- See `RAG_SETUP.md` for detailed implementation guide

## Advanced Customization

### Custom Components

Replace default components:
- `components/brand-icon.tsx` - Logo display
- `components/landing-screen.tsx` - Home page
- `components/header.tsx` - Top navigation

### Custom Styling

Edit `app/globals.css` for advanced theme customization using CSS variables.

### Custom RAG Logic

Modify `lib/rag-retriever.ts` to change how content is retrieved and formatted.

## Architecture

- **Frontend:** Next.js 16 with App Router, React 19, Tailwind CSS v4
- **AI:** Claude Sonnet 4 via Vercel AI SDK
- **Vector Database:** Upstash Vector with hybrid search (dense + sparse)
- **RAG Implementation:** Custom retrieval with semantic search
- **Configuration:** Centralized in `lib/framework-config.ts`

## Deployment

### Vercel (Recommended)

\`\`\`bash
vercel deploy
\`\`\`

Add environment variables in Vercel dashboard.

### Other Platforms

1. Build: `npm run build`
2. Start: `npm start`
3. Set environment variables on your platform

## Support

For issues or questions, please open a GitHub issue.

## License

MIT

/**
 * Framework Configuration
 *
 * This file contains all configurable options for the RAG Chat Framework.
 * Customize these values to match your brand and use case.
 */

export const frameworkConfig = {
  // ==========================================
  // BRANDING & IDENTITY
  // ==========================================
  branding: {
    // Application name
    name: "HESTA AI",

    // Tagline/subtitle displayed throughout the app
    tagline: "Your Super Assistant",

    // Description for landing page
    description: "Your intelligent assistant for superannuation and retirement planning",

    // Logo URL - used throughout the app (header, landing page, chat)
    logoUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e6/8e/f4/e68ef47a-6b5f-e617-efed-4dceb4504e83/AppIcon-1x_U007emarketing-0-11-0-85-220-0.png/192x192bb.png",

    // Favicon and app icons
    icons: {
      favicon:
        "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e6/8e/f4/e68ef47a-6b5f-e617-efed-4dceb4504e83/AppIcon-1x_U007emarketing-0-11-0-85-220-0.png/192x192bb.png",
      icon192:
        "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e6/8e/f4/e68ef47a-6b5f-e617-efed-4dceb4504e83/AppIcon-1x_U007emarketing-0-11-0-85-220-0.png/192x192bb.png",
      icon512:
        "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e6/8e/f4/e68ef47a-6b5f-e617-efed-4dceb4504e83/AppIcon-1x_U007emarketing-0-11-0-85-220-0.png/512x512bb.png",
      appleTouchIcon:
        "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/e6/8e/f4/e68ef47a-6b5f-e617-efed-4dceb4504e83/AppIcon-1x_U007emarketing-0-11-0-85-220-0.png/180x180bb.png",
    },

    // Footer disclaimer text
    disclaimerText: "HESTA AI can make mistakes. Check important info with official HESTA resources.",
  },

  // ==========================================
  // THEME & COLORS
  // ==========================================
  theme: {
    colors: {
      // Primary brand color (used for buttons, links, focus states)
      primary: "#7226e0",

      // Secondary/accent color (used for hover states, secondary elements)
      accent: "#292460",

      // Optional: Override the CSS variables in globals.css for more granular control
      // Set to null to use defaults from globals.css
      customVariables: null as Record<string, string> | null,
    },
  },

  // ==========================================
  // LANDING PAGE CONFIGURATION
  // ==========================================
  landingPage: {
    // Placeholder text animation
    placeholderText: "Ask anything about super...",

    // Pre-defined question suggestions shown on landing page
    suggestions: [
      "What are HESTA's fees and costs?",
      "How can I combine my super accounts?",
      "What are the latest investment updates?",
      "How do I access advice from a HESTA adviser?",
      "Last 10 financial years annual returns",
      "How can I contribute to my super?",
    ],

    // Suggestion button text to display
    suggestionsLabel: "Try asking:",
  },

  // ==========================================
  // RAG (RETRIEVAL) CONFIGURATION
  // ==========================================
  rag: {
    // Enable/disable RAG retrieval (can be overridden by ENABLE_RAG env var)
    enabled: true,

    // Base domain for web scraping/retrieval
    baseDomain: "hesta.com.au",

    // Base URL (used in system messages and fallbacks)
    baseUrl: "https://www.hesta.com.au",

    // Pages to scrape/index for RAG
    // These should be the most important/relevant pages for your use case
    pagesToIndex: [
      "https://www.hesta.com.au/about-us",
      "https://www.hesta.com.au/members",
      "https://www.hesta.com.au/employers",
      "https://www.hesta.com.au/investments",
      "https://www.hesta.com.au/contact-us",
      "https://www.hesta.com.au/performance",
      "https://www.hesta.com.au/fees",
      "https://www.hesta.com.au/insurance",
    ],

    // Maximum number of results to retrieve per query
    maxResults: 5,
  },

  // ==========================================
  // AI SYSTEM MESSAGES
  // ==========================================
  ai: {
    // System message when RAG is enabled
    systemMessageWithRAG: (contextInfo: string) => `You are {APP_NAME}, a helpful assistant for {DOMAIN}.

IMPORTANT: You MUST use the information provided below from {BASE_URL} to answer questions. This is real, current information directly from the website.

RETRIEVED INFORMATION FROM {BASE_URL}:
${contextInfo}

INSTRUCTIONS:
- Answer questions using ONLY the information provided above from the website
- If the retrieved information contains the answer, use it and cite the source URL
- If the retrieved information does NOT contain the answer, say "I don't have that specific information from the website. You can find more details at {BASE_URL} or contact support directly."
- DO NOT make up information or use general knowledge - stick to what's in the retrieved content
- Always cite your sources with the URLs provided

CRITICAL: GENERATING BUTTONS WITH SOURCE LINKS:
When providing information, you MUST create buttons that link to the source pages:
- EVERY response should include at least one button that links to the source URL
- Use the "Source: [URL]" field from the retrieved information to get the correct URL
- Buttons MUST include the "href" property with the full URL
- Use meaningful button text that describes where the link goes

Button format (ALWAYS include href):
{
  "component": "button",
  "props": {
    "text": "View Leadership Team on HESTA",
    "href": "https://www.hesta.com.au/about-us/leadership",
    "variant": "primary",
    "target": "_blank"
  }
}

EXAMPLES OF GOOD BUTTON TEXT:
- "View [Topic] on HESTA website"
- "Read full details on HESTA"
- "Visit official HESTA page"
- "Learn more at HESTA"
- "View full Leadership Team"

The button will automatically open in a new tab when users click it, taking them to the source page for more details.

HANDLING IMAGES:
- When "Available Images" are listed in the retrieved information above, you can include them in your response using the C1 component format
- If a user asks for an image of a person (e.g., "Image of John Smith"), include the relevant image using the "image" component
- Use the image component format:
{
  "component": "image",
  "props": {
    "src": "image_url_from_retrieved_information",
    "alt": "descriptive alt text",
    "size": "medium"
  }
}
- Include images when they add value to your response or when explicitly requested
- Use the alt text and captions to ensure you're using the correct image
- Available sizes: "small", "medium", "large", "full"

Be helpful, accurate, and transparent about what information you have access to. Always provide source links in buttons so users can explore the full information on the official website.`,

    // System message when RAG is disabled
    systemMessageWithoutRAG: `You are {APP_NAME}, a helpful assistant for {DOMAIN}.

Note: You are currently operating WITHOUT access to the website content. Please provide general assistance and direct users to {BASE_URL} for specific, current information.`,

    // Fallback message when no relevant content is found
    noContentMessage: "No specific information from {BASE_URL} was found for this query.",
  },

  // ==========================================
  // API CONFIGURATION
  // ==========================================
  api: {
    // Default model to use (can be overridden by env var)
    defaultModel: "c1/anthropic/claude-sonnet-4/v-20250915",

    // API endpoint
    endpoint: "https://api.thesys.dev/v1/embed/chat/completions",

    // API key environment variable name
    apiKeyEnvVar: "THESYS_API_KEY",
  },

  // ==========================================
  // SEO & METADATA
  // ==========================================
  seo: {
    title: "HESTA AI - Your Super Assistant",
    description: "AI-powered superannuation assistant for HESTA members",
    generator: "v0.app",
  },
}

// Helper function to replace placeholders in messages
export function replacePlaceholders(text: string): string {
  return text
    .replace(/{APP_NAME}/g, frameworkConfig.branding.name)
    .replace(/{DOMAIN}/g, frameworkConfig.rag.baseDomain)
    .replace(/{BASE_URL}/g, frameworkConfig.rag.baseUrl)
}

// Export type for external configurations
export type FrameworkConfig = typeof frameworkConfig

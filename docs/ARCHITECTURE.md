# Solution Architecture Document
## HESTA AI - Generative UI Chat Assistant

---

## 1. Architecture Overview

### 1.1 High-Level Architecture
The HESTA AI application follows a modern, serverless architecture pattern using Next.js 16 with the App Router. The system is designed as a single-page application (SPA) with server-side API routes acting as a secure proxy to external AI services.

### 1.2 Architecture Principles
1. **Separation of Concerns:** Clear boundaries between presentation, business logic, and data layers
2. **Component-Based Design:** Modular, reusable React components
3. **Security by Default:** API keys never exposed to client
4. **Progressive Enhancement:** Core functionality works, enhanced features layer on top
5. **Mobile-First:** Responsive design prioritizing mobile experience
6. **Performance:** Streaming responses, code splitting, optimized rendering

---

## 2. System Components

### 2.1 Client Layer

#### Web Browser
- **Supported Browsers:** Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- **Devices:** Desktop, tablet, mobile (iOS 14+, Android 10+)
- **Requirements:** JavaScript enabled, modern CSS support

#### Key Technologies
- React 19.2.0 (client-side rendering)
- Next.js 16.0.3 (framework)
- Tailwind CSS 4.1.9 (styling)

---

### 2.2 Presentation Layer

#### Component Architecture

**Landing Screen (`landing-screen.tsx`)**
- Purpose: First user touchpoint, brand introduction
- Features:
  - Animated sparkle effects on logo
  - Typewriter animation for placeholder
  - Pre-defined suggestion prompts
  - Search input with keyboard support
- State Management: Local component state
- Interactions: Click suggestions, type query, submit

**Chat Interface (`chat-interface.tsx`)**
- Purpose: Main conversation UI
- Features:
  - Message history display
  - Real-time streaming responses
  - Auto-scroll to latest message
  - Input validation and submission
- State Management:
  \`\`\`typescript
  messages: Message[]        // Conversation history
  input: string             // Current user input
  isLoading: boolean        // API request state
  \`\`\`
- Side Effects:
  - Scroll on new messages
  - Send initial message on mount
  - API calls on user submission

**Message Bubble (`message-bubble.tsx`)**
- Purpose: Display individual messages
- Features:
  - User vs. assistant styling differentiation
  - Timestamp display
  - Support for text and React node content
- Layout: Flexbox with avatar/icon + content

**C1 Renderer (`c1-renderer.tsx`)**
- Purpose: Transform JSON component specs into React UI
- Features:
  - JSON parsing with error handling
  - HTML entity decoding
  - Recursive component rendering
  - 20+ supported component types
  - Graceful degradation to plain text
- Component Registry:
  - Card, Header, InlineHeader
  - DataTile, MiniCard, MiniCardBlock
  - List (bulleted, icon-based)
  - Accordion, Callout, Steps
  - ButtonGroup, Button, Badge
  - Input, RadioGroup, RadioItem
  - MiniChart, BarChartV2
  - ProfileTile
  - Icon (Lucide React)

**Header (`header.tsx`)**
- Purpose: App branding and navigation
- Features:
  - Logo with home navigation
  - Consistent across chat sessions

**Supporting Components**
- `sparkle-effect.tsx`: Loading animation
- `logo-sparkles.tsx`: Animated logo overlay
- `hesta-ai-icon.tsx`: HESTA branding icon

---

### 2.3 State Management Layer

#### React State Pattern
- **Approach:** Component-level state with useState hooks
- **State Lifting:** State lifted to closest common ancestor
- **No Global Store:** Simple enough to avoid Redux/Zustand

#### Key State Objects

**Message Interface**
\`\`\`typescript
interface Message {
  id: string              // Unique identifier (timestamp)
  role: "user" | "assistant"
  content: string | React.ReactNode  // Text or rendered components
  timestamp: Date
}
\`\`\`

**State Flow**
1. User types input → `input` state updates
2. User submits → `messages` array grows, `isLoading` = true
3. API streams response → `messages` array updated with assistant message
4. Stream complete → `isLoading` = false

---

### 2.4 API Layer

#### Next.js API Route: `/api/chat`
- **Method:** POST
- **Purpose:** Secure proxy to Thesys API
- **Security:** API key stored server-side only

**Request Flow:**
\`\`\`
Client → POST /api/chat → Validate → Add System Prompt → 
Thesys API → Stream Response → Client
\`\`\`

**Implementation Details:**
\`\`\`typescript
// Request validation
const { messages } = await request.json()

// System prompt injection
const messagesWithSystem = [
  { role: "system", content: "You are HESTA AI..." },
  ...conversationHistory
]

// Proxy to Thesys
const response = await fetch("https://api.thesys.dev/v1/embed/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.THESYS_API_KEY}`,
  },
  body: JSON.stringify({
    model: "c1/anthropic/claude-sonnet-4/v-20250915",
    messages: messagesWithSystem,
    stream: true,
  }),
})

// Stream back to client
return new Response(response.body, {
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  },
})
\`\`\`

**Error Handling:**
- API errors → 500 response with error message
- Network errors → Catch and return friendly message
- Client displays fallback message

---

### 2.5 External Services Layer

#### Thesys API
- **Provider:** Thesys.dev
- **Endpoint:** `https://api.thesys.dev/v1/embed/chat/completions`
- **Model:** `c1/anthropic/claude-sonnet-4/v-20250915`
- **Features:**
  - Streaming responses (Server-Sent Events)
  - Conversation context support
  - Component-based response format (C1)

#### Claude Sonnet 4
- **Provider:** Anthropic (via Thesys)
- **Capabilities:**
  - Natural language understanding
  - Structured JSON output (C1 format)
  - Domain knowledge (trained on diverse data)
  - Context window: 200k+ tokens

---

### 2.6 Security Layer

#### Environment Variables
\`\`\`bash
THESYS_API_KEY=<secret-key>
\`\`\`

#### Security Measures
1. **API Key Protection:** Never exposed to client-side code
2. **Server-Side Proxy:** All external API calls from server
3. **Input Sanitization:** React's built-in XSS protection
4. **HTTPS Only:** Enforced in production
5. **CORS Configuration:** Restrictive CORS policies
6. **Rate Limiting:** Rely on API provider's rate limits (future: implement app-level)

---

### 2.7 UI Component Library Layer

#### shadcn/ui + Radix UI
- **Purpose:** Pre-built, accessible, customizable components
- **Components Used:**
  - Accordion, Alert Dialog, Avatar
  - Badge, Button, Card
  - Checkbox, Collapsible, Command
  - Dialog, Dropdown Menu, Form
  - Input, Label, Radio Group
  - Scroll Area, Select, Separator
  - Tabs, Toast, Tooltip

**Benefits:**
- Accessibility built-in (ARIA labels, keyboard nav)
- Consistent design system
- Customizable via Tailwind classes
- Type-safe with TypeScript

---

### 2.8 Styling System Layer

#### Tailwind CSS 4
- **Approach:** Utility-first CSS framework
- **Configuration:** Inline theme in `globals.css`

**Design Tokens:**
\`\`\`css
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(240 10% 3.9%);
  --primary: hsl(240 5.9% 10%);
  --border: hsl(240 5.9% 90%);
  --radius: 0.6rem;
  /* ... more tokens */
}
\`\`\`

**Responsive Strategy:**
- Mobile-first breakpoints
- Tailwind responsive prefixes (`md:`, `lg:`)
- Flexible layouts (flexbox, grid)

---

## 3. Data Flow

### 3.1 User Interaction Flow

\`\`\`
1. User lands on page
   ↓
2. Landing Screen rendered
   ↓
3. User types or clicks suggestion
   ↓
4. Input captured in state
   ↓
5. User submits (Enter or click button)
   ↓
6. Message added to state
   ↓
7. Chat Interface rendered
   ↓
8. API call initiated
   ↓
9. Loading indicator shown
   ↓
10. Stream starts arriving
    ↓
11. C1 Renderer parses and renders components
    ↓
12. User sees rich UI response
    ↓
13. User asks follow-up → repeat from step 3
\`\`\`

### 3.2 API Request Flow

\`\`\`
Client Component
  ↓
  handleAIResponse()
  ↓
  Build conversation history
  ↓
  POST /api/chat
  ↓
  API Route Handler
  ↓
  Inject system prompt
  ↓
  Proxy to Thesys API
  ↓
  Thesys → Claude Sonnet 4
  ↓
  Stream response (SSE)
  ↓
  Parse data chunks
  ↓
  Extract content deltas
  ↓
  Accumulate response
  ↓
  Return complete response
  ↓
  Client: C1 Renderer
  ↓
  Parse JSON structure
  ↓
  Render components
  ↓
  Display to user
\`\`\`

### 3.3 Component Rendering Flow

\`\`\`
Raw AI Response (JSON string)
  ↓
  decodeHTMLEntities()
  ↓
  JSON.parse()
  ↓
  Component Spec Object
  ↓
  ComponentRenderer()
  ↓
  Switch on component type
  ↓
  Map props to React component
  ↓
  Recursively render children
  ↓
  Return React Element
  ↓
  React DOM updates
  ↓
  User sees rendered UI
\`\`\`

---

## 4. Deployment Architecture

### 4.1 Recommended Platform: Vercel
- **Reasoning:** Built for Next.js, seamless integration
- **Features:**
  - Automatic deployments from Git
  - Edge network (global CDN)
  - Serverless functions for API routes
  - Environment variable management
  - Preview deployments per branch

### 4.2 Infrastructure Components

\`\`\`
User Request
  ↓
Vercel Edge Network (CDN)
  ↓
Static Assets (cached)
  |
  └→ HTML, CSS, JS, Images
  
Dynamic Requests
  ↓
Serverless Function (API Route)
  ↓
External API Call (Thesys)
  ↓
Response (streamed back)
\`\`\`

### 4.3 Scaling Strategy
- **Horizontal Scaling:** Serverless functions scale automatically
- **Edge Caching:** Static assets served from nearest edge location
- **API Rate Limits:** Monitor Thesys API usage, implement queuing if needed
- **Database:** Not required for POC (future: session storage, user data)

---

## 5. Technology Stack Summary

### Frontend
- **Framework:** Next.js 16.0.3 (React 19.2.0)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4.1.9
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React 0.454.0
- **State Management:** React Hooks (useState, useEffect, useRef)

### Backend
- **Runtime:** Node.js (Next.js API routes)
- **API Integration:** Fetch API
- **Streaming:** Server-Sent Events (SSE)

### AI & ML
- **Provider:** Thesys API
- **Model:** Claude Sonnet 4 (Anthropic)
- **SDK:** Vercel AI SDK 4.0.38 (future integration)

### DevOps
- **Version Control:** Git
- **Deployment:** Vercel (recommended)
- **Environment Management:** .env.local
- **Package Manager:** npm/pnpm/yarn

---

## 6. Non-Functional Requirements

### 6.1 Performance
- **Time to First Byte:** < 200ms
- **Time to Interactive:** < 2s
- **Streaming Latency:** < 1s to first token
- **Bundle Size:** < 500KB (initial JS)

### 6.2 Scalability
- **Concurrent Users:** 10,000+ (Vercel serverless handles)
- **API Throughput:** Depends on Thesys limits
- **Geographical Distribution:** Global via CDN

### 6.3 Reliability
- **Uptime Target:** 99.9%
- **Error Rate:** < 1%
- **Fallback Mechanism:** Graceful error messages

### 6.4 Security
- **Data Encryption:** HTTPS in transit
- **Authentication:** None (POC), future OAuth/SAML
- **Authorization:** None (public access)
- **Audit Logging:** Future requirement

### 6.5 Accessibility
- **WCAG Compliance:** AA level
- **Screen Reader Support:** Yes
- **Keyboard Navigation:** Full support
- **Color Contrast:** Meets WCAG AA

---

## 7. Integration Points

### 7.1 Current Integrations
1. **Thesys API:** AI model access
2. **Vercel AI SDK:** Future enhanced streaming support

### 7.2 Future Integrations
1. **HESTA Member Portal:** SSO, account data
2. **Analytics Platform:** Google Analytics, Mixpanel
3. **Error Tracking:** Sentry, LogRocket
4. **A/B Testing:** Optimizely, LaunchDarkly
5. **Customer Support:** Intercom, Zendesk

---

## 8. Disaster Recovery & Monitoring

### 8.1 Error Handling Strategy
- **API Failures:** Display user-friendly message with retry option
- **Parsing Errors:** Fall back to plain text display
- **Network Errors:** Offline indicator, retry mechanism

### 8.2 Monitoring (Future)
- **Performance Monitoring:** Web Vitals, Lighthouse CI
- **Error Tracking:** Sentry for client and server errors
- **API Monitoring:** Track response times, error rates
- **User Analytics:** Session recording, funnel analysis

### 8.3 Backup & Recovery
- **Code Repository:** Git (GitHub/GitLab)
- **Deployment Rollback:** Vercel instant rollback
- **Data Backup:** Not applicable (no database in POC)

---

## 9. Development Workflow

### 9.1 Local Development
\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

### 9.2 Environment Setup
\`\`\`bash
# .env.local
THESYS_API_KEY=your-api-key-here
\`\`\`

### 9.3 Code Organization
\`\`\`
project-root/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── chat/          # Chat endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   ├── landing-screen.tsx
│   ├── chat-interface.tsx
│   ├── c1-renderer.tsx
│   └── ...
├── docs/                  # Documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   └── solution-architecture.mmd
├── public/                # Static assets
├── .env.local            # Environment variables
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
\`\`\`

---

## 10. Diagrams

### 10.1 System Context Diagram
*(See solution-architecture.mmd for detailed Mermaid diagram)*

### 10.2 Component Hierarchy
\`\`\`
App (page.tsx)
├── LandingScreen
│   ├── LogoSparkles
│   ├── Input
│   └── Button (x6 suggestions)
└── ChatInterface
    ├── Header
    │   └── Logo
    ├── MessageBubble (x N)
    │   ├── HestaAIIcon (assistant)
    │   └── C1Renderer
    │       └── Dynamic Components
    └── Input + Button (send)
\`\`\`

### 10.3 Data Model
\`\`\`typescript
// Message
{
  id: string
  role: "user" | "assistant"
  content: string | ReactNode
  timestamp: Date
}

// C1 Component Spec
{
  component: string
  type?: string
  props?: {
    [key: string]: any
  }
  content?: string
  children?: C1ComponentSpec | C1ComponentSpec[]
}
\`\`\`

---

## 11. Conclusion

The HESTA AI Generative UI Chat Assistant represents a modern, scalable architecture for AI-powered conversational interfaces. By leveraging Next.js 16, React 19, and Claude Sonnet 4, the system provides a responsive, secure, and user-friendly experience for HESTA superannuation members seeking guidance on their retirement savings.

The modular component architecture allows for easy extension and maintenance, while the serverless deployment model ensures scalability and cost-effectiveness. The generative UI approach, powered by the C1 Renderer, enables rich, interactive responses that go beyond traditional chatbot text interfaces.

Future enhancements will focus on personalization, authentication, and deeper integration with HESTA's member portal, transforming the POC into a production-ready member service tool.

---

**Document Metadata:**
- Version: 1.0
- Last Updated: 2025-11-20
- Author: v0 AI
- Status: Final

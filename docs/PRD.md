# Product Requirements Document (PRD)
## HESTA AI - Generative UI Chat Assistant

**Version:** 1.0  
**Date:** November 20, 2025  
**Status:** Proof of Concept (POC)  
**Project Code:** Generative UI: POC

---

## Executive Summary

HESTA AI is an intelligent conversational assistant designed specifically for HESTA superannuation fund members. The application leverages advanced AI capabilities to provide personalized guidance on superannuation queries, retirement planning, contribution strategies, and investment options. The system features a generative UI architecture that dynamically renders rich, interactive components based on user queries.

---

## 1. Product Overview

### 1.1 Vision
To democratize access to superannuation knowledge by providing HESTA members with an intelligent, accessible, and user-friendly AI assistant that can answer complex super-related questions 24/7.

### 1.2 Mission
Empower HESTA members to make informed decisions about their retirement savings through conversational AI that delivers personalized, accurate, and actionable information.

### 1.3 Target Audience
- **Primary:** HESTA superannuation fund members (health and community services workers)
- **Secondary:** Potential members researching superannuation options
- **Demographics:** Working professionals aged 25-65, primarily in health and community services sectors

---

## 2. Problem Statement

### 2.1 Current Challenges
1. **Complexity:** Superannuation regulations and options are complex and difficult for members to understand
2. **Accessibility:** Limited access to professional financial advice outside business hours
3. **Information Overload:** Members struggle to find relevant information from extensive documentation
4. **Personalization:** Generic information doesn't address individual member circumstances
5. **Engagement:** Traditional FAQ systems fail to engage users effectively

### 2.2 Solution
A conversational AI assistant with generative UI capabilities that:
- Provides instant, accurate responses to super-related queries
- Dynamically generates rich, interactive visual components
- Offers personalized guidance based on user context
- Available 24/7 with consistent quality
- Presents complex information in digestible, visual formats

---

## 3. Product Features & Requirements

### 3.1 Core Features

#### 3.1.1 Landing Experience
**Description:** Beautiful, engaging landing screen that introduces users to HESTA AI

**Requirements:**
- Animated logo with sparkle effects
- Typewriter animation for placeholder text ("Ask anything about super...")
- Six pre-defined suggestion prompts covering common queries:
  - "How does superannuation work?"
  - "What are the contribution limits?"
  - "Help me understand retirement planning"
  - "Tell me about investment options"
  - "How do salary sacrifice contributions work?"
  - "What are the insurance options available?"
- Prominent search input with clear call-to-action
- Responsive design for mobile and desktop
- Disclaimer: "HESTA AI can make mistakes. Check important info with official HESTA resources."

**Priority:** P0 (Must Have)

#### 3.1.2 Chat Interface
**Description:** Real-time conversational interface with streaming AI responses

**Requirements:**
- Message history display (user and assistant messages)
- Streaming response visualization with loading indicator
- Message timestamps
- Auto-scroll to latest message
- Input field with send button
- Keyboard shortcuts (Enter to send)
- Disabled input during AI processing
- Visual feedback for active input (purple border on focus)
- Persistent chat history during session
- Return to home functionality via logo click

**Priority:** P0 (Must Have)

#### 3.1.3 Generative UI System (C1 Renderer)
**Description:** Dynamic component rendering system that transforms AI responses into rich interactive UI

**Supported Components:**
- **Cards:** Container components with shadows and borders
- **Headers:** Title and subtitle sections with hierarchy
- **Data Tiles:** Display key metrics and statistics
- **Mini Cards:** Compact information blocks in grid layouts
- **Icons:** Contextual icons for visual emphasis (TrendingUp, DollarSign, Shield, Target, etc.)
- **Lists:** Bulleted and icon-based list items
- **Accordions:** Collapsible content sections
- **Callouts:** Highlighted information boxes
- **Steps:** Sequential instruction layouts
- **Charts:** Bar charts and mini visualizations
- **Profile Tiles:** User/advisor profile displays with contact information
- **Buttons:** Interactive call-to-action elements
- **Forms:** Input fields, radio groups, labels
- **Badges/Labels:** Status indicators and tags

**Requirements:**
- Parse JSON-structured responses from AI model
- Recursively render nested component hierarchies
- Handle malformed or partial responses gracefully
- Support responsive layouts (mobile-first design)
- Maintain consistent design system (shadcn/ui)
- HTML entity decoding
- Error boundary fallback to plain text

**Priority:** P0 (Must Have)

#### 3.1.4 AI Integration
**Description:** Integration with Thesys API for Claude Sonnet 4 model access

**Requirements:**
- Model: `c1/anthropic/claude-sonnet-4/v-20250915`
- Streaming responses via Server-Sent Events (SSE)
- System prompt defining HESTA AI persona and context
- Conversation history management
- Error handling and fallback responses
- API key security (environment variables)
- Rate limiting considerations
- Response timeout handling

**System Prompt:**
\`\`\`
You are HESTA AI, a helpful assistant for HESTA superannuation members. 
HESTA is an Australian industry super fund for health and community services workers. 
Help users with questions about their super balance, contributions, retirement planning, 
investment options, and general superannuation information. 
Be professional, friendly, and accurate.
\`\`\`

**Priority:** P0 (Must Have)

### 3.2 Design Requirements

#### 3.2.1 Visual Design
- **Color Palette:**
  - Primary: `#7226e0` (Purple - HESTA brand color)
  - Secondary: `#292460` (Dark purple hover state)
  - Background gradients for landing page
  - Semantic color tokens for theme support
- **Typography:**
  - Clean, readable font hierarchy
  - Responsive font sizes (text-sm to text-2xl)
  - Line height: leading-relaxed for body text
- **Spacing:**
  - Consistent gap/padding using Tailwind spacing scale
  - Responsive spacing (3-4 on mobile, 4-6 on desktop)
- **Components:**
  - shadcn/ui component library
  - Rounded corners (rounded-2xl for major elements)
  - Subtle shadows and borders
  - Smooth transitions and hover states

#### 3.2.2 Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Touch-friendly interaction targets (minimum 44px)
- Horizontal scroll prevention
- Safe area padding for mobile devices
- Collapsible/stacked layouts on small screens

#### 3.2.3 Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast (WCAG AA minimum)
- Focus indicators
- Alt text for images
- Semantic HTML structure

### 3.3 Technical Requirements

#### 3.3.1 Technology Stack
- **Frontend Framework:** Next.js 16.0.3 (App Router)
- **React Version:** 19.2.0
- **UI Library:** shadcn/ui + Radix UI primitives
- **Styling:** Tailwind CSS 4.1.9
- **Icons:** Lucide React
- **Language:** TypeScript 5
- **AI SDK:** Vercel AI SDK 4.0.38

#### 3.3.2 Architecture
- Client-side rendering for interactive components
- Server-side API routes for AI proxy
- Environment variable management
- Component-based architecture
- Separation of concerns (UI, logic, data)

#### 3.3.3 Performance
- Code splitting and lazy loading
- Optimized bundle size
- Streaming responses (no full response wait)
- Efficient re-renders (React best practices)
- Image optimization
- CSS-in-JS optimization

#### 3.3.4 Security
- API key stored in environment variables
- Server-side API proxying (no client exposure)
- Input sanitization
- XSS prevention
- CORS configuration
- Rate limiting (API level)

---

## 4. User Stories

### 4.1 As a HESTA Member
1. **US-001:** As a member, I want to ask questions about my superannuation in natural language so that I can understand complex topics easily
2. **US-002:** As a member, I want to see visually rich responses with charts and cards so that information is easier to digest
3. **US-003:** As a member, I want to access the assistant on my mobile device so that I can get help on-the-go
4. **US-004:** As a member, I want to see suggested questions so that I know what to ask
5. **US-005:** As a member, I want to return to the home screen so that I can start a new conversation

### 4.2 As a New User
1. **US-006:** As a new user, I want an engaging landing page so that I understand what the assistant can do
2. **US-007:** As a new user, I want to see example questions so that I can quickly test the system

### 4.3 As a Mobile User
1. **US-008:** As a mobile user, I want a responsive layout so that the app works well on my phone
2. **US-009:** As a mobile user, I want touch-friendly buttons so that I can easily interact with the app

---

## 5. User Journey

### 5.1 Primary User Flow
1. **Landing:** User arrives at landing page, sees animated logo and branding
2. **Exploration:** User reads placeholder animation and suggested questions
3. **Initiation:** User either types a question or clicks a suggestion
4. **Processing:** User sees loading animation (sparkle effect)
5. **Response:** User receives rich, visual response with interactive components
6. **Continuation:** User can ask follow-up questions in the same conversation
7. **Reset:** User can click logo to return to landing page and start fresh

### 5.2 Edge Cases
- **No Input:** Send button disabled when input is empty
- **API Error:** Fallback message displayed with guidance to visit official resources
- **Malformed Response:** Graceful degradation to plain text display
- **Long Response:** Auto-scroll keeps latest content visible
- **Network Issues:** Error handling with user-friendly messages

---

## 6. Success Metrics

### 6.1 User Engagement
- **Sessions per user:** Target 2+ sessions per user per week
- **Messages per session:** Target 5+ messages per session
- **Suggestion click rate:** Target 40% of users click suggestions
- **Return user rate:** Target 30% users return within 7 days

### 6.2 Performance Metrics
- **Time to first byte:** < 200ms
- **Time to interactive:** < 2 seconds
- **Response streaming start:** < 1 second
- **Error rate:** < 1% of requests

### 6.3 Quality Metrics
- **Response accuracy:** 95%+ accurate responses (human evaluation)
- **User satisfaction:** 4+ stars average rating
- **Completion rate:** 80%+ of conversations reach resolution

---

## 7. Technical Specifications

### 7.1 API Endpoints

#### POST /api/chat
**Purpose:** Proxy streaming chat requests to Thesys API

**Request Body:**
\`\`\`json
{
  "messages": [
    {
      "role": "system" | "user" | "assistant",
      "content": "string"
    }
  ]
}
\`\`\`

**Response:** Server-Sent Events (SSE) stream
\`\`\`
data: {"choices": [{"delta": {"content": "..."}}]}
\`\`\`

**Error Response:**
\`\`\`json
{
  "error": "Error message string"
}
\`\`\`

### 7.2 Environment Variables
- `THESYS_API_KEY`: API key for Thesys AI service
- `NEXT_PUBLIC_*`: Client-side environment variables (if needed)

### 7.3 Component Structure
\`\`\`
app/
├── page.tsx              # Main page with state management
├── layout.tsx            # Root layout
├── globals.css           # Global styles and design tokens
└── api/
    └── chat/
        └── route.ts      # Chat API endpoint

components/
├── landing-screen.tsx    # Landing page component
├── chat-interface.tsx    # Chat UI component
├── message-bubble.tsx    # Individual message display
├── c1-renderer.tsx       # Generative UI renderer
├── header.tsx            # App header
├── logo-sparkles.tsx     # Animated logo component
├── sparkle-effect.tsx    # Loading animation
└── hesta-ai-icon.tsx     # HESTA AI icon component
\`\`\`

---

## 8. Constraints & Assumptions

### 8.1 Constraints
1. **API Dependency:** Relies on Thesys API availability and performance
2. **Model Limitations:** Claude Sonnet 4 model capabilities and knowledge cutoff
3. **Disclaimer Required:** Legal requirement to display accuracy disclaimer
4. **No Authentication:** POC does not include user authentication
5. **No Personalization:** Cannot access actual member data or account information

### 8.2 Assumptions
1. Users have stable internet connection
2. Users understand English
3. Modern browser support (Chrome, Safari, Firefox, Edge latest versions)
4. Users can interact with chat interfaces
5. API key remains valid and within rate limits

---

## 9. Risks & Mitigation

### 9.1 Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| API downtime | High | Medium | Implement fallback messaging, retry logic |
| Incorrect responses | High | Medium | Display disclaimer, implement feedback mechanism |
| Performance issues | Medium | Low | Streaming responses, code optimization |
| Security vulnerabilities | High | Low | Server-side API proxy, input sanitization |

### 9.2 Business Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User trust issues | High | Medium | Clear disclaimers, brand alignment |
| Regulatory compliance | High | Low | Legal review, accurate information sourcing |
| Cost overruns | Medium | Medium | API usage monitoring, rate limiting |

---

## 10. Future Enhancements (Out of Scope for POC)

### 10.1 Phase 2 Features
- User authentication and account linking
- Personalized responses based on actual member data
- Multi-language support
- Voice input/output capabilities
- Document upload and analysis
- Appointment scheduling with advisors
- Email transcript functionality

### 10.2 Phase 3 Features
- Mobile native apps (iOS, Android)
- Integration with HESTA member portal
- Real-time super balance display
- Contribution calculators with live data
- Push notifications for important updates
- Advanced analytics and insights
- A/B testing framework

---

## 11. Dependencies

### 11.1 External Dependencies
- Thesys API service availability
- Claude Sonnet 4 model access
- npm package registry
- Vercel deployment platform (optional)

### 11.2 Internal Dependencies
- Design system (shadcn/ui) documentation
- HESTA brand guidelines
- Legal/compliance team approval for disclaimer text
- Content team for suggestion prompts

---

## 12. Release Plan

### 12.1 Phase 1: POC (Current)
- ✅ Core chat functionality
- ✅ Generative UI rendering
- ✅ Landing page experience
- ✅ Mobile responsive design
- ✅ Basic error handling

### 12.2 Phase 2: Beta
- User authentication
- Analytics integration
- Performance monitoring
- User feedback collection
- A/B testing setup

### 12.3 Phase 3: Production
- Full security audit
- Load testing and scaling
- Legal/compliance approval
- Marketing launch materials
- Customer support integration

---

## 13. Glossary

- **C1:** Component-based AI response format used by Claude models
- **Generative UI:** AI-generated user interface components
- **HESTA:** Health Employees Superannuation Trust Australia
- **POC:** Proof of Concept
- **SSE:** Server-Sent Events (streaming protocol)
- **Super:** Australian slang for superannuation (retirement fund)
- **Thesys API:** AI model provider API service

---

## 14. Approval & Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | TBD | | |
| Technical Lead | TBD | | |
| Design Lead | TBD | | |
| Legal/Compliance | TBD | | |

---

**Document Revision History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-20 | v0 AI | Initial PRD creation |

---

**Contact Information:**
- Product Team: [product@hesta.com.au]
- Technical Support: [techsupport@hesta.com.au]
- Legal/Compliance: [compliance@hesta.com.au]

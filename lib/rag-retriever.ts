// Simple RAG implementation that fetches content from hesta.com.au
// without requiring external vector databases

import { queryVectorStore } from "./vector-store"

interface ScrapedContent {
  url: string
  title: string
  content: string
  relevanceScore: number
}

interface RetrievedContent {
  text: string
  url: string
  title: string
  score: number
}

// Key Hesta pages to search
const HESTA_PAGES = [
  "https://www.hesta.com.au/about-us",
  "https://www.hesta.com.au/members",
  "https://www.hesta.com.au/employers",
  "https://www.hesta.com.au/investments",
  "https://www.hesta.com.au/contact-us",
  "https://www.hesta.com.au/performance",
  "https://www.hesta.com.au/fees",
  "https://www.hesta.com.au/insurance",
]

/**
 * Extract keywords from user query
 */
function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    "what",
    "how",
    "when",
    "where",
    "who",
    "why",
    "is",
    "are",
    "the",
    "a",
    "an",
    "can",
    "do",
    "does",
    "about",
    "tell",
    "me",
  ])

  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
}

/**
 * Calculate relevance score based on keyword matching
 */
function calculateRelevance(content: string, keywords: string[]): number {
  const lowerContent = content.toLowerCase()
  let score = 0

  keywords.forEach((keyword) => {
    const regex = new RegExp(keyword, "gi")
    const matches = lowerContent.match(regex)
    if (matches) {
      score += matches.length
    }
  })

  return score
}

/**
 * Fetch and parse content from a URL
 */
async function fetchPageContent(url: string): Promise<{ title: string; content: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HestaBot/1.0)",
      },
    })

    if (!response.ok) {
      console.error(`[v0] Failed to fetch ${url}: ${response.status}`)
      return null
    }

    const html = await response.text()

    // Basic HTML parsing - extract text content
    // Remove script and style tags
    let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")

    // Extract title
    const titleMatch = cleanHtml.match(/<title[^>]*>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].replace(/&[^;]+;/g, "").trim() : "Hesta Page"

    // Extract body content
    const bodyMatch = cleanHtml.match(/<body[^>]*>(.*?)<\/body>/is)
    const bodyContent = bodyMatch ? bodyMatch[1] : cleanHtml

    // Remove all HTML tags and clean up
    const content = bodyContent
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000) // Limit content length

    return { title, content }
  } catch (error) {
    console.error(`[v0] Error fetching ${url}:`, error)
    return null
  }
}

/**
 * Retrieve relevant content from hesta.com.au based on user query
 */
export async function retrieveHestaContent(query: string, maxResults = 3): Promise<RetrievedContent[]> {
  console.log("[v0] Retrieving content for query:", query)

  try {
    const results = await queryVectorStore(query, maxResults)

    return results.map((result) => ({
      text: result.text,
      url: result.metadata.url,
      title: result.metadata.title,
      score: result.score,
    }))
  } catch (error) {
    console.error("[v0] Error retrieving from vector store:", error)
    return []
  }
}

/**
 * Format retrieved content for LLM context
 */
export function formatContextForLLM(retrievedContent: RetrievedContent[]): string {
  if (retrievedContent.length === 0) {
    return "No specific information from hesta.com.au was found for this query."
  }

  return retrievedContent
    .map((content, index) => {
      return `
Source ${index + 1}: ${content.title}
URL: ${content.url}
Relevance Score: ${content.score.toFixed(3)}
Content: ${content.text}
---`
    })
    .join("\n\n")
}

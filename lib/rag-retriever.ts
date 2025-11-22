// Simple RAG implementation that fetches content from configured domain
// without requiring external vector databases

import { queryVectorStore } from "./vector-store"
import { frameworkConfig } from "./framework-config"

interface RetrievedContent {
  text: string
  url: string
  title: string
  score: number
  images?: Array<{ src: string; alt?: string }>
}

/**
 * Retrieve relevant content based on user query
 */
export async function retrieveContent(query: string, maxResults?: number): Promise<RetrievedContent[]> {
  const max = maxResults || frameworkConfig.rag.maxResults
  console.log("[v0] Retrieving content for query:", query)

  try {
    const results = await queryVectorStore(query, max)

    return results.map((result) => ({
      text: result.text,
      url: result.metadata.url,
      title: result.metadata.title,
      score: result.score,
      images: result.metadata.images || [],
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
    return frameworkConfig.ai.noContentMessage.replace("{BASE_URL}", frameworkConfig.rag.baseUrl)
  }

  return retrievedContent
    .map((content, index) => {
      const imagesSection =
        content.images && content.images.length > 0
          ? `\nAvailable Images:\n${content.images.map((img) => `  - ${img.src}${img.alt ? ` (${img.alt})` : ""}`).join("\n")}`
          : ""

      return `
Source ${index + 1}: ${content.title}
URL: ${content.url}
Relevance Score: ${content.score.toFixed(3)}${imagesSection}
Content: ${content.text}
---`
    })
    .join("\n\n")
}

// Export for backward compatibility
export const retrieveHestaContent = retrieveContent

// Upstash Vector Store for RAG implementation
// Uses Upstash's built-in embedding generation (no OpenAI key needed)
import { Index } from "@upstash/vector"

// Initialize Upstash Vector client
export function getVectorStore() {
  return new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  })
}

export interface DocumentChunk {
  id: string
  text: string
  metadata: {
    url: string
    title: string
    timestamp: number
  }
}

/**
 * Upsert documents into the vector store
 * Upstash will automatically generate embeddings from the text
 */
export async function upsertDocuments(chunks: DocumentChunk[]) {
  const index = getVectorStore()

  const vectors = chunks.map((chunk) => ({
    id: chunk.id,
    data: chunk.text, // Raw text, not embeddings
    metadata: chunk.metadata,
  }))

  try {
    await index.upsert(vectors)
    console.log(`[v0] Upserted ${vectors.length} documents to vector store`)
  } catch (error) {
    console.error("[v0] Error upserting documents:", error)
    throw error
  }
}

/**
 * Query the vector store for relevant content using direct REST API
 * Upstash will automatically embed the query text
 */
export async function queryVectorStore(query: string, topK = 3) {
  console.log(`[v0] Querying vector store with: "${query}"`)

  const url = process.env.UPSTASH_VECTOR_REST_URL!
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN!

  try {
    const response = await fetch(`${url}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: query,
        topK,
        includeMetadata: true,
        includeData: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Query failed with status ${response.status}:`, errorText)

      if (response.status === 404) {
        console.error(
          "[v0] 404 Error: The Upstash Vector index may not be configured properly. Check that your UPSTASH_VECTOR_REST_URL is correct.",
        )
      }
      return []
    }

    const data = await response.json()
    const results = data.result || []

    console.log(`[v0] Query successful, found ${results.length} relevant documents`)

    return results.map((result: any) => ({
      text: result.data || "",
      score: result.score,
      metadata: result.metadata as DocumentChunk["metadata"],
    }))
  } catch (error) {
    console.error("[v0] Error querying vector store:", error)
    return []
  }
}

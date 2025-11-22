// Upstash Vector Store for RAG implementation
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

async function generateEmbedding(text: string): Promise<number[]> {
  console.log("[v0] Generating embedding for text:", text.substring(0, 50) + "...")

  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY || process.env.THESYS_API_KEY}`,
    },
    body: JSON.stringify({
      input: text,
      model: "text-embedding-3-small",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[v0] Embedding API failed with status ${response.status}:`, errorText)
    throw new Error(`Embedding generation failed: ${response.status} - ${errorText}`)
  }

  const data = await response.json()

  if (!data.data || !data.data[0] || !data.data[0].embedding) {
    console.error("[v0] Unexpected embedding response structure:", data)
    throw new Error("Invalid embedding response structure")
  }

  console.log(`[v0] Successfully generated embedding with ${data.data[0].embedding.length} dimensions`)
  return data.data[0].embedding
}

/**
 * Upsert documents into the vector store with embeddings
 */
export async function upsertDocuments(chunks: DocumentChunk[]) {
  const index = getVectorStore()

  const vectorsWithEmbeddings = await Promise.all(
    chunks.map(async (chunk) => {
      const embedding = await generateEmbedding(chunk.text)
      return {
        id: chunk.id,
        vector: embedding, // Dense vector embeddings
        metadata: {
          ...chunk.metadata,
          text: chunk.text, // Store text in metadata
        },
      }
    }),
  )

  try {
    await index.upsert(vectorsWithEmbeddings)
    console.log(`[v0] Upserted ${vectorsWithEmbeddings.length} documents to vector store`)
  } catch (error) {
    console.error("[v0] Error upserting documents:", error)
    throw error
  }
}

/**
 * Query the vector store for relevant content with embeddings
 */
export async function queryVectorStore(query: string, topK = 3) {
  console.log(`[v0] Querying vector store with: "${query}"`)
  console.log(`[v0] Using URL: ${process.env.UPSTASH_VECTOR_REST_URL}`)

  const url = process.env.UPSTASH_VECTOR_REST_URL!
  const token = process.env.UPSTASH_VECTOR_REST_TOKEN!

  try {
    const queryEmbedding = await generateEmbedding(query)

    const response = await fetch(`${url}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vector: queryEmbedding, // Send dense vector instead of text
        topK,
        includeMetadata: true,
        includeVectors: false,
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
      text: result.metadata?.text || "",
      score: result.score,
      metadata: result.metadata as DocumentChunk["metadata"],
    }))
  } catch (error) {
    console.error("[v0] Error querying vector store:", error)
    return []
  }
}

// Upstash Vector Store for RAG implementation
// Uses Upstash's built-in embedding generation (no OpenAI key needed)
import { Index } from "@upstash/vector";

// Initialize Upstash Vector client
export function getVectorStore() {
  return new Index({
    url: "https://primary-jaybird-54045-us1-vector.upstash.io",
    token:
      "ABkFMHByaW1hcnktamF5YmlyZC01NDA0NS11czFhZG1pbk5ETXdNRGd3T0RJdFl6YzVaUzAwTlRRM0xUaG1NRGd0T1RneVpETTNNekV6TVRJMw==",
  });
}

export interface ImageData {
  src: string;
  alt?: string;
  title?: string;
  caption?: string;
}

export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    url: string;
    title: string;
    timestamp: number;
    images?: ImageData[];
  };
}

/**
 * Upsert documents into the vector store
 * Upstash will automatically generate embeddings from the text
 */
export async function upsertDocuments(chunks: DocumentChunk[]) {
  const index = getVectorStore();

  const vectors = chunks.map((chunk) => ({
    id: chunk.id,
    data: chunk.text, // Raw text, not embeddings
    metadata: chunk.metadata,
  }));

  try {
    await index.upsert(vectors);
    console.log(`[v0] Upserted ${vectors.length} documents to vector store`);
  } catch (error) {
    console.error("[v0] Error upserting documents:", error);
    throw error;
  }
}

/**
 * Query the vector store for relevant content using direct REST API
 * Upstash will automatically embed the query text
 */
export async function queryVectorStore(query: string, topK = 3) {
  console.log(`[v0] Querying vector store with: "${query}"`);

  const url = "https://primary-jaybird-54045-us1-vector.upstash.io";
  const token =
    "ABkFMHByaW1hcnktamF5YmlyZC01NDA0NS11czFhZG1pbk5ETXdNRGd3T0RJdFl6YzVaUzAwTlRRM0xUaG1NRGd0T1RneVpETTNNekV6TVRJMw==";

  try {
    const response = await fetch(`${url}/query-data`, {
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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[v0] Query failed with status ${response.status}:`,
        errorText
      );

      // If query-data doesn't work, the index might not have an embedding model
      // Return empty results instead of crashing
      console.error(
        "[v0] The index may not be configured with an embedding model. Please recreate your Upstash index with an embedding model."
      );
      return [];
    }

    const data = await response.json();
    const results = data.result || [];

    console.log(
      `[v0] Query successful, found ${results.length} relevant documents`
    );

    return results.map((result: any) => ({
      text: result.data || "",
      score: result.score,
      metadata: result.metadata as DocumentChunk["metadata"],
    }));
  } catch (error) {
    console.error("[v0] Error querying vector store:", error);
    return [];
  }
}

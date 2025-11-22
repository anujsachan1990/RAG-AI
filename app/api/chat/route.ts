import { retrieveContent, formatContextForLLM } from "@/lib/rag-retriever"
import { frameworkConfig, replacePlaceholders } from "@/lib/framework-config"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()
    const userQuery = lastUserMessage?.content || ""

    console.log("[v0] User query:", userQuery)

    // Check if RAG is enabled (env var takes precedence over config)
    const ragEnabled =
      process.env.ENABLE_RAG === "false" ? false : process.env.ENABLE_RAG === "true" || frameworkConfig.rag.enabled

    console.log("[v0] RAG enabled:", ragEnabled)

    let systemMessage = ""

    if (ragEnabled) {
      const relevantContent = await retrieveContent(userQuery, frameworkConfig.rag.maxResults)
      const contextInfo = formatContextForLLM(relevantContent)

      console.log("[v0] Retrieved context from vector store, results:", relevantContent.length)
      console.log("[v0] Retrieved content details:", JSON.stringify(relevantContent, null, 2))
      console.log("[v0] Full formatted context being sent to LLM:")
      console.log(contextInfo)

      systemMessage = replacePlaceholders(frameworkConfig.ai.systemMessageWithRAG(contextInfo))
    } else {
      console.log("[v0] RAG is disabled - using pure LLM responses without retrieved context")
      systemMessage = replacePlaceholders(frameworkConfig.ai.systemMessageWithoutRAG)
    }

    const enhancedMessages = [
      {
        role: "system",
        content: systemMessage,
      },
      ...messages,
    ]

    const apiKey = process.env[frameworkConfig.api.apiKeyEnvVar]
    if (!apiKey) {
      throw new Error(`Missing API key: ${frameworkConfig.api.apiKeyEnvVar}`)
    }

    const response = await fetch(frameworkConfig.api.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || frameworkConfig.api.defaultModel,
        messages: enhancedMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] API error:", response.status, errorText)
      return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("[v0] Error in chat route:", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate AI response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

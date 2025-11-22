import { retrieveHestaContent, formatContextForLLM } from "@/lib/rag-retriever"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()
    const userQuery = lastUserMessage?.content || ""

    console.log("[v0] User query:", userQuery)

    const ragEnabled = process.env.ENABLE_RAG === "true"
    console.log("[v0] RAG enabled:", ragEnabled)

    let systemMessage = "You are Hesta AI, a helpful assistant for Hesta superannuation fund."

    if (ragEnabled) {
      const relevantContent = await retrieveHestaContent(userQuery, 5)
      const contextInfo = formatContextForLLM(relevantContent)

      console.log("[v0] Retrieved context from vector store, results:", relevantContent.length)
      console.log("[v0] Retrieved content details:", JSON.stringify(relevantContent, null, 2))
      console.log("[v0] Full formatted context being sent to LLM:")
      console.log(contextInfo)

      systemMessage = `You are Hesta AI, a helpful assistant for Hesta superannuation fund. 

IMPORTANT: You MUST use the information provided below from hesta.com.au to answer questions. This is real, current information directly from Hesta's website.

RETRIEVED INFORMATION FROM HESTA.COM.AU:
${contextInfo}

INSTRUCTIONS:
- Answer questions using ONLY the information provided above from Hesta's website
- If the retrieved information contains the answer, use it and cite the source URL
- If the retrieved information does NOT contain the answer, say "I don't have that specific information from Hesta's website. You can find more details at https://www.hesta.com.au or contact Hesta directly."
- DO NOT make up information or use general knowledge about superannuation - stick to what's in the retrieved content
- Always cite your sources with the URLs provided

Be helpful, accurate, and transparent about what information you have access to.`
    } else {
      console.log("[v0] RAG is disabled - using pure LLM responses without retrieved context")
      systemMessage = `You are Hesta AI, a helpful assistant for Hesta superannuation fund. 

Note: You are currently operating WITHOUT access to Hesta's website content. Please provide general assistance and direct users to https://www.hesta.com.au for specific, current information.`
    }

    const enhancedMessages = [
      {
        role: "system",
        content: systemMessage,
      },
      ...messages,
    ]

    const response = await fetch("https://api.thesys.dev/v1/embed/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.THESYS_API_KEY}`,
      },
      body: JSON.stringify({
        model: "c1/anthropic/claude-sonnet-4/v-20250915",
        messages: enhancedMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Thesys API error:", response.status, errorText)
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

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowUp } from "lucide-react"
import { SparkleEffect } from "@/components/sparkle-effect"
import { MessageBubble } from "@/components/message-bubble"
import { C1Renderer } from "@/components/c1-renderer"
import { HestaAIIcon } from "@/components/hesta-ai-icon"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string | React.ReactNode
  timestamp: Date
}

interface ChatInterfaceProps {
  initialMessage?: string
}

export function ChatInterface({ initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (initialMessage && !hasInitialized.current) {
      hasInitialized.current = true
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: initialMessage,
        timestamp: new Date(),
      }
      setMessages([userMessage])
      handleAIResponse(initialMessage, [userMessage])
    }
  }, [initialMessage])

  const handleButtonClick = (buttonName: string, buttonText: string) => {
    if (isLoading) return

    // Send the button text as a new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: buttonText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    handleAIResponse(buttonText, [...messages, userMessage])
  }

  const handleAIResponse = async (userInput: string, existingMessages: Message[] = messages) => {
    setIsLoading(true)

    const conversationHistory = existingMessages
      .filter((msg) => typeof msg.content === "string")
      .map((msg) => ({
        role: msg.role,
        content: msg.content as string,
      }))

    conversationHistory.push({
      role: "user",
      content: userInput,
    })

    const messagesWithSystem = [
      {
        role: "system",
        content:
          "You are HESTA AI, a helpful assistant for HESTA superannuation members. HESTA is an Australian industry super fund for health and community services workers. Help users with questions about their super balance, contributions, retirement planning, investment options, and general superannuation information. Be professional, friendly, and accurate.",
      },
      ...conversationHistory,
    ]

    const assistantMessageId = (Date.now() + 1).toString()

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesWithSystem }),
      })

      if (!response.body) {
        throw new Error("Response body is empty")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let rawC1Response = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = JSON.parse(line.slice(6))
              const content = jsonData.choices?.[0]?.delta?.content
              if (content) {
                rawC1Response += content
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      const c1UI = <C1Renderer c1Response={rawC1Response} onButtonClick={handleButtonClick} />

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content: c1UI,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error in handleAIResponse:", error)
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting right now. Please try again or visit my.hesta.com.au for immediate assistance.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")

    await handleAIResponse(currentInput, [...messages, userMessage])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="container mx-auto flex h-[calc(100vh-4rem)] max-w-4xl flex-col px-3 md:px-4 overflow-x-hidden py-4 md:py-6">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 md:py-6">
        <div className="space-y-4 md:space-y-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-start gap-2 md:gap-3">
              <div className="flex items-center justify-center">
                <HestaAIIcon size="sm" showSparkle={true} />
              </div>
              <div className="flex-1">
                <div className="rounded-2xl rounded-tl-sm bg-card p-3 shadow-sm md:p-4">
                  <SparkleEffect />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background pb-safe py-3 md:py-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask anything about super..."
            className="flex-1 border-2 border-input bg-card px-4 py-3 text-sm focus-visible:ring-0 md:px-6 md:py-6 md:text-base"
            style={{
              borderColor: input ? "#7226e0" : undefined,
            }}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-12 w-12 shrink-0 md:h-14 md:w-14"
            style={{
              backgroundColor: "#7226e0",
            }}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        </div>
        <p className="mt-2 px-2 text-center text-[10px] leading-tight text-muted-foreground md:text-xs">
          HESTA AI can make mistakes. Check important info with official HESTA resources.
        </p>
      </div>
    </div>
  )
}

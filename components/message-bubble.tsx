import { User } from "lucide-react"
import type React from "react"
import { HestaAIIcon } from "@/components/hesta-ai-icon"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string | React.ReactNode // Support React nodes for generative UI
  timestamp: Date
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex items-start gap-2 md:gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="flex shrink-0 items-center justify-center">
        {isUser ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary md:h-8 md:w-8">
            <User className="h-3.5 w-3.5 text-secondary-foreground md:h-4 md:w-4" />
          </div>
        ) : (
          <HestaAIIcon size="sm" showSparkle={false} />
        )}
      </div>
      <div className={`flex-1 max-w-full overflow-hidden ${isUser ? "flex justify-end" : ""}`}>
        <div
          className={`rounded-2xl p-3 shadow-sm md:p-4 max-w-full overflow-hidden break-words ${
            isUser ? "rounded-tr-sm bg-primary text-primary-foreground" : "rounded-tl-sm bg-card text-card-foreground"
          }`}
        >
          {typeof message.content === "string" ? (
            <p className="text-pretty text-sm leading-relaxed md:text-base">{message.content}</p>
          ) : (
            message.content
          )}
        </div>
      </div>
    </div>
  )
}

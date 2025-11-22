"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { LogoSparkles } from "./logo-sparkles"
import { frameworkConfig } from "@/lib/framework-config"

interface LandingScreenProps {
  onStartChat: (initialMessage: string) => void
}

export function LandingScreen({ onStartChat }: LandingScreenProps) {
  const [input, setInput] = useState("")
  const [placeholder, setPlaceholder] = useState("")
  const fullText = frameworkConfig.landingPage.placeholderText

  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setPlaceholder(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 50) // Fast typing speed (50ms per character)

    return () => clearInterval(typingInterval)
  }, [fullText])

  const handleSubmit = () => {
    if (input.trim()) {
      onStartChat(input.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    }
  }

  const suggestions = frameworkConfig.landingPage.suggestions

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-8 md:px-6">
      <div className="w-full max-w-3xl">
        {/* Title with sparkle icon */}
        <div className="mb-8 text-center md:mb-12">
          <div className="mb-4 inline-flex items-center justify-center md:mb-6">
            <div className="relative">
              <LogoSparkles />

              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg md:h-32 md:w-32">
                <img
                  src={frameworkConfig.branding.logoUrl || "/placeholder.svg"}
                  alt={`${frameworkConfig.branding.name} Logo`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
          <p className="mt-3 text-pretty px-4 text-sm text-muted-foreground md:mt-4 md:text-lg">
            {frameworkConfig.branding.description}
          </p>
        </div>

        {/* Search box */}
        <div className="mb-6 md:mb-8">
          <div className="relative flex items-center gap-2 rounded-[10px] border-2 border-input bg-card p-1.5 shadow-lg transition-all hover:border-primary focus-within:border-primary focus-within:shadow-xl md:p-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="flex-1 border-0 bg-transparent px-4 py-3 text-base focus-visible:ring-0 md:px-6 md:py-4 md:text-lg"
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              size="icon"
              className="h-11 w-11 shrink-0 rounded-full bg-primary hover:bg-primary/90 md:h-12 md:w-12"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Suggestions */}
        <div className="space-y-2.5 md:space-y-3">
          <p className="text-center text-xs text-muted-foreground md:text-sm">
            {frameworkConfig.landingPage.suggestionsLabel}
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion)}
                className="cursor-pointer border border-transparent bg-[#7226e0] px-3 py-3 text-center text-xs text-white transition-all hover:bg-[#292460] hover:text-white md:py-2.5"
                style={{
                  backgroundColor: frameworkConfig.theme.colors.primary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = frameworkConfig.theme.colors.accent
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = frameworkConfig.theme.colors.primary
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-8 px-4 text-center text-xs text-muted-foreground md:mt-12">
          {frameworkConfig.branding.disclaimerText}
        </p>
      </div>
    </div>
  )
}

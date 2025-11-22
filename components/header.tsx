"use client"

import { HestaAIIcon } from "@/components/hesta-ai-icon"

interface HeaderProps {
  onLogoClick?: () => void
}

export function Header({ onLogoClick }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-3 md:h-16 md:px-4">
        <button
          onClick={onLogoClick}
          className="flex flex-col items-center gap-0.5 transition-opacity hover:opacity-80 md:gap-1"
        >
          <HestaAIIcon size="sm" showSparkle={true} />
          <p className="text-[10px] text-muted-foreground md:text-xs">Your Super Assistant</p>
        </button>
      </div>
    </header>
  )
}

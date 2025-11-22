"use client"

import { useEffect, useState } from "react"

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
  color: string
}

export function SparkleEffect() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    const colors = [
      "oklch(0.6 0.2 285)", // Primary purple
      "oklch(0.7 0.22 180)", // Accent teal
      "oklch(0.8 0.15 285)", // Light purple
      "oklch(0.75 0.2 180)", // Light teal
    ]

    const newSparkles: Sparkle[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))

    setSparkles(newSparkles)
  }, [])

  return (
    <div className="relative flex h-12 w-full items-center justify-start">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Getting info</span>
        <div className="flex gap-1">
          <div
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animation: "wave 1.4s ease-in-out infinite", animationDelay: "0ms" }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animation: "wave 1.4s ease-in-out infinite", animationDelay: "200ms" }}
          />
          <div
            className="h-1.5 w-1.5 rounded-full bg-primary"
            style={{ animation: "wave 1.4s ease-in-out infinite", animationDelay: "400ms" }}
          />
        </div>
      </div>

      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="pointer-events-none absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="sparkle"
            style={{
              filter: "blur(0.5px)",
            }}
          >
            <path
              d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z"
              fill={sparkle.color}
              opacity="0.8"
            />
            <circle cx="12" cy="10" r="2" fill={sparkle.color} opacity="0.6" />
          </svg>
        </div>
      ))}
    </div>
  )
}

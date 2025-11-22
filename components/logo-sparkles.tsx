"use client"

import { useEffect, useState } from "react"

interface Sparkle {
  id: number
  delay: number
  duration: number
}

export function LogoSparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)

      const newSparkles: Sparkle[] = [
        { id: 0, delay: 0.3, duration: 1.5 },
        { id: 1, delay: 0.8, duration: 1.5 },
      ]

      setSparkles(newSparkles)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="pointer-events-none absolute -right-2 -top-2 h-16 w-16">
      {sparkles.map((sparkle, index) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle-float"
          style={{
            left: index === 0 ? "60%" : "80%",
            top: index === 0 ? "20%" : "40%",
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z"
              fill="#7226e0"
              opacity="0.95"
            />
            <circle cx="12" cy="10" r="3" fill="#9d4edd" opacity="0.8" />
          </svg>
        </div>
      ))}
    </div>
  )
}

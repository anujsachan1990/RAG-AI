"use client"

interface HestaAIIconProps {
  size?: "sm" | "md" | "lg"
  showSparkle?: boolean
}

export function HestaAIIcon({ size = "md", showSparkle = true }: HestaAIIconProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-32 w-32",
  }

  const sparkleSizes = {
    sm: 12,
    md: 14,
    lg: 20,
  }

  const sparklePositions = {
    sm: { right: "-4px", top: "-4px" },
    md: { right: "-6px", top: "-6px" },
    lg: { right: "-8px", top: "-8px" },
  }

  return (
    <div className="relative inline-block">
      <img
        src="/images/design-mode/1200x600wa.png"
        alt="HESTA AI"
        className={`${sizeClasses[size]} rounded-lg object-cover`}
      />
      {showSparkle && (
        <div
          className="pointer-events-none absolute"
          style={{
            right: sparklePositions[size].right,
            top: sparklePositions[size].top,
          }}
        >
          <svg
            width={sparkleSizes[size]}
            height={sparkleSizes[size]}
            viewBox="0 0 24 24"
            fill="none"
            className="animate-pulse"
          >
            <path
              d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z"
              fill="#7226e0"
              opacity="0.95"
            />
            <circle cx="12" cy="10" r="3" fill="#9d4edd" opacity="0.8" />
          </svg>
        </div>
      )}
    </div>
  )
}

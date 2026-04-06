import { useEffect, useState } from 'react'

interface ScoreCircleProps {
  percentage: number
  size?: number
  label?: string
}

export function ScoreCircle({ percentage, size = 160, label }: ScoreCircleProps) {
  const [animated, setAnimated] = useState(0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animated / 100) * circumference

  const color =
    percentage >= 80 ? 'var(--color-success)' :
    percentage >= 60 ? 'var(--color-accent)' :
    'var(--color-error)'

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
        {/* Background circle */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="10"
        />
        {/* Progress circle */}
        <circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
        {/* Percentage text */}
        <text
          x="60" y="56"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fontFamily="DM Sans, sans-serif"
          fill="var(--color-text)"
        >
          {animated}%
        </text>
        <text
          x="60" y="74"
          textAnchor="middle"
          fontSize="10"
          fill="var(--color-text-muted)"
          fontFamily="DM Sans, sans-serif"
        >
          SCORE
        </text>
      </svg>
      {label && (
        <p className="text-sm text-text-muted font-sans text-center">{label}</p>
      )}
    </div>
  )
}

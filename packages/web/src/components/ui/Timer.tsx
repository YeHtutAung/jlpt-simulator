import { useEffect, useRef } from 'react'
import { useExamStore } from '@/store/examStore'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface TimerProps {
  mode: 'full_exam' | 'practice'
}

export function Timer({ mode }: TimerProps) {
  const timeRemaining = useExamStore(s => s.timeRemaining)
  const timerActive  = useExamStore(s => s.timerActive)
  const showWarning  = useExamStore(s => s.showWarning)
  const tickTimer    = useExamStore(s => s.tickTimer)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!timerActive) return

    intervalRef.current = setInterval(() => {
      tickTimer()
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [timerActive, tickTimer])

  const isWarning = showWarning || timeRemaining <= 300

  return (
    <div
      className={[
        'flex items-center gap-2 font-sans font-semibold tabular-nums',
        'px-4 py-2 rounded-full border-2 transition-colors duration-300',
        isWarning
          ? 'border-error text-error bg-red-50 animate-pulse'
          : 'border-border text-text bg-surface',
      ].join(' ')}
      role="timer"
      aria-label={`Time remaining: ${formatTime(timeRemaining)}`}
    >
      {/* Clock icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>

      <span className="text-lg">{formatTime(timeRemaining)}</span>

      {mode === 'practice' && (
        <span className="text-xs text-text-muted ml-1">(practice)</span>
      )}
    </div>
  )
}

interface ProgressBarProps {
  current: number
  total: number
  answered: number
  flagged: number
}

export function ProgressBar({ current, total, answered, flagged }: ProgressBarProps) {
  const progress = Math.round((current / total) * 100)

  return (
    <div className="w-full space-y-1">
      {/* Bar */}
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-300 rounded-full"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
        />
      </div>

      {/* Stats */}
      <div className="flex justify-between text-xs text-text-muted font-sans">
        <span>{current} / {total} questions</span>
        <span className="flex gap-3">
          <span className="text-success">✓ {answered}</span>
          {flagged > 0 && (
            <span className="text-warning">⚑ {flagged}</span>
          )}
          <span>{total - answered} left</span>
        </span>
      </div>
    </div>
  )
}

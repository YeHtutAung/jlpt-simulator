import { memo, useRef, useState } from 'react'

interface AudioPlayerProps {
  audioUrl: string
  restrictReplay?: boolean   // true in full_exam mode
  onPlay?: () => void
}

export const AudioPlayer = memo(function AudioPlayer({ audioUrl, restrictReplay = false, onPlay }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [progress, setProgress] = useState(0)

  const canPlay = !restrictReplay || !hasPlayed

  function handlePlay() {
    if (!canPlay || !audioRef.current) return
    audioRef.current.play()
    setIsPlaying(true)
    setHasPlayed(true)
    onPlay?.()
  }

  function handlePause() {
    audioRef.current?.pause()
    setIsPlaying(false)
  }

  function handleEnded() {
    setIsPlaying(false)
    setProgress(100)
  }

  function handleTimeUpdate() {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    setProgress((audio.currentTime / audio.duration) * 100)
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-surface rounded-xl border border-border">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        onPause={() => setIsPlaying(false)}
      />

      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={!canPlay}
          className={[
            'w-10 h-10 rounded-full flex items-center justify-center',
            'transition-all duration-150 focus:outline-none',
            canPlay
              ? 'bg-primary text-white hover:bg-primary-hover active:scale-95'
              : 'bg-border text-text-muted cursor-not-allowed',
          ].join(' ')}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isPlaying ? (
            /* Pause icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            /* Play icon */
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-100 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status label */}
        <span className="text-xs text-text-muted font-sans whitespace-nowrap">
          {restrictReplay && hasPlayed && !isPlaying
            ? '⚠ Played'
            : isPlaying
            ? '▶ Playing...'
            : '聴解'}
        </span>
      </div>

      {restrictReplay && hasPlayed && !isPlaying && (
        <p className="text-xs text-text-muted text-center">
          Audio can only be played once in exam mode.
        </p>
      )}
    </div>
  )
})

import { useState } from 'react'
import { supabaseAdmin } from '../lib/supabase'

interface AudioFile {
  groupNumber: number
  file:        File
  status:      'pending' | 'uploading' | 'done' | 'error'
  storagePath: string
  error?:      string
}

interface AudioUploaderProps {
  level: string
  year:  number
  month: string
  /** Called when all uploads complete, with map of groupNumber → storage path */
  onComplete: (paths: Record<number, string>) => void
}

export default function AudioUploader({ level, year, month, onComplete }: AudioUploaderProps) {
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const parsed: AudioFile[] = []

    for (const file of selected) {
      // Expected naming: N5Q1.mp3, N5Q2.mp3, etc.
      const match = file.name.match(/^[Nn][1-5][Qq](\d+)\.mp3$/i)
      if (!match) {
        alert(`Unrecognised file name: ${file.name}\nExpected format: ${level}Q1.mp3, ${level}Q2.mp3, etc.`)
        continue
      }

      const groupNumber = parseInt(match[1], 10)
      const storagePath = `${level.toLowerCase()}/${year}/${month}/q${groupNumber}.mp3`

      parsed.push({
        groupNumber,
        file,
        status:      'pending',
        storagePath,
      })
    }

    setAudioFiles(parsed.sort((a, b) => a.groupNumber - b.groupNumber))
  }

  async function handleUpload() {
    if (audioFiles.length === 0) return
    setIsUploading(true)

    const completedPaths: Record<number, string> = {}

    for (const af of audioFiles) {
      setAudioFiles((prev) =>
        prev.map((f) => f.groupNumber === af.groupNumber ? { ...f, status: 'uploading' } : f)
      )

      const { error } = await supabaseAdmin.storage
        .from('audio')
        .upload(af.storagePath, af.file, {
          contentType: 'audio/mpeg',
          upsert:      true,
        })

      if (error) {
        setAudioFiles((prev) =>
          prev.map((f) =>
            f.groupNumber === af.groupNumber
              ? { ...f, status: 'error', error: error.message }
              : f
          )
        )
      } else {
        setAudioFiles((prev) =>
          prev.map((f) =>
            f.groupNumber === af.groupNumber ? { ...f, status: 'done' } : f
          )
        )
        completedPaths[af.groupNumber] = af.storagePath
      }
    }

    setIsUploading(false)
    onComplete(completedPaths)
  }

  const allDone = audioFiles.length > 0 && audioFiles.every((f) => f.status === 'done')

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          Select MP3 files ({level}Q1.mp3 – {level}Q4.mp3)
        </label>
        <input
          type="file"
          accept=".mp3,audio/mpeg"
          multiple
          onChange={handleFilesSelected}
          disabled={isUploading}
          className="block w-full text-sm text-[var(--color-text-muted)]
            file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-[var(--color-border)]
            file:text-sm file:font-medium file:bg-white file:text-[var(--color-text)]
            hover:file:bg-gray-50"
        />
      </div>

      {audioFiles.length > 0 && (
        <div className="space-y-1.5">
          {audioFiles.map((af) => (
            <div
              key={af.groupNumber}
              className="flex items-center justify-between text-sm bg-white border border-[var(--color-border)] rounded px-3 py-2"
            >
              <span className="text-[var(--color-text-muted)] font-mono text-xs">{af.storagePath}</span>
              <StatusIcon status={af.status} error={af.error} />
            </div>
          ))}
        </div>
      )}

      {audioFiles.length > 0 && !allDone && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="px-4 py-2 bg-[var(--color-accent)] text-white text-sm font-medium rounded
            hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Uploading...' : `Upload ${audioFiles.length} file${audioFiles.length !== 1 ? 's' : ''}`}
        </button>
      )}

      {allDone && (
        <p className="text-sm text-[var(--color-success)] font-medium">
          All audio files uploaded successfully.
        </p>
      )}
    </div>
  )
}

function StatusIcon({ status, error }: { status: AudioFile['status']; error?: string }) {
  if (status === 'pending')   return <span className="text-[var(--color-text-muted)] text-xs">pending</span>
  if (status === 'uploading') return <span className="text-[var(--color-accent)] text-xs">uploading...</span>
  if (status === 'done')      return <span className="text-[var(--color-success)] text-xs">✓ done</span>
  return <span className="text-[var(--color-error)] text-xs" title={error}>✗ error</span>
}

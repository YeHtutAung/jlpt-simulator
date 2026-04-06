import { useRef, useState } from 'react'
import { ExamSchema, type ExamSchemaType } from '@jlpt/shared'

interface JsonUploaderProps {
  onValidated: (exam: ExamSchemaType, raw: object) => void
}

export default function JsonUploader({ onValidated }: JsonUploaderProps) {
  const [isDragging, setIsDragging]     = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [fileName, setFileName]         = useState<string | null>(null)
  const fileInputRef                    = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.name.endsWith('.json')) {
      setError('Only .json files are accepted')
      return
    }

    setError(null)
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const raw    = JSON.parse(e.target?.result as string) as unknown
        const result = ExamSchema.safeParse(raw)

        if (!result.success) {
          const issues = result.error.issues
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join('\n')
          setError(`Validation failed:\n${issues}`)
          return
        }

        onValidated(result.data, raw as object)
      } catch {
        setError('Invalid JSON file — could not parse')
      }
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-3">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragging
            ? 'border-[var(--color-primary)] bg-red-50'
            : 'border-[var(--color-border)] hover:border-gray-400'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-[var(--color-text-muted)] text-sm">
          Drag & drop exam JSON here, or{' '}
          <span className="text-[var(--color-primary)] font-medium">browse</span>
        </p>
        {fileName && (
          <p className="mt-2 text-sm font-medium text-[var(--color-text)]">{fileName}</p>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {error && (
        <pre className="bg-red-50 border border-red-200 text-[var(--color-error)] text-xs p-3 rounded whitespace-pre-wrap">
          {error}
        </pre>
      )}
    </div>
  )
}

interface PassageReaderProps {
  passage: string
  label?: string
}

export function PassageReader({ passage, label }: PassageReaderProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
      {label && (
        <p className="text-sm font-semibold text-text-muted border-b border-border pb-2">
          {label}
        </p>
      )}
      <div className="text-ja text-base leading-8 whitespace-pre-wrap">
        {passage}
      </div>
    </div>
  )
}

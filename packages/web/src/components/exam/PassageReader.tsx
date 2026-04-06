interface PassageReaderProps {
  passage: string
  instructions?: string
}

export function PassageReader({ passage, instructions }: PassageReaderProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
      {instructions && (
        <p className="text-sm text-text-muted font-sans border-b border-border pb-2">
          {instructions}
        </p>
      )}
      <div className="text-ja text-base leading-8 whitespace-pre-wrap">
        {passage}
      </div>
    </div>
  )
}

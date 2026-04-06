import type { ReviewQuestion } from '@jlpt/shared'

interface ReviewCardProps {
  question: ReviewQuestion
  index: number
}

export function ReviewCard({ question, index }: ReviewCardProps) {
  return (
    <div
      className={[
        'rounded-xl border-2 p-5 space-y-3 animate-fade-in',
        question.is_correct ? 'border-success bg-green-50/40' : 'border-error bg-red-50/40',
      ].join(' ')}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-accent text-white
                           flex items-center justify-center text-xs font-semibold">
            {question.question_number}
          </span>
          <span className={[
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            question.is_correct
              ? 'bg-success text-white'
              : 'bg-error text-white',
          ].join(' ')}>
            {question.is_correct ? '✓ Correct' : '✗ Incorrect'}
          </span>
          {question.flagged && (
            <span className="text-xs text-warning">⚑ Flagged</span>
          )}
        </div>
        <span className="text-xs text-text-muted font-sans">
          {question.time_spent}s
        </span>
      </div>

      {/* Question text */}
      <p className="text-ja text-sm leading-relaxed text-text">
        {question.question_text}
      </p>

      {/* Options */}
      <div className="grid grid-cols-1 gap-1.5">
        {question.options.map(opt => {
          const isCorrect  = opt.number === question.correct_answer
          const isSelected = opt.number === question.selected_answer
          const isWrong    = isSelected && !isCorrect

          return (
            <div
              key={opt.number}
              className={[
                'flex items-start gap-2 px-3 py-2 rounded-lg text-sm',
                isCorrect  ? 'bg-success/10 text-success font-medium' :
                isWrong    ? 'bg-error/10 text-error line-through' :
                             'text-text-muted',
              ].join(' ')}
            >
              <span className="shrink-0 font-semibold">{opt.number}.</span>
              <span className="text-ja">{opt.text}</span>
              {isCorrect && <span className="ml-auto shrink-0">✓</span>}
              {isWrong   && <span className="ml-auto shrink-0">✗</span>}
            </div>
          )
        })}
      </div>

      {/* Explanation */}
      {question.explanation && (
        <div className="bg-surface rounded-lg p-3 border border-border">
          <p className="text-xs font-semibold text-accent mb-1">Explanation</p>
          <p className="text-xs text-text leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

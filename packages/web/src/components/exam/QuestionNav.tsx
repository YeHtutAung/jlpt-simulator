import { memo } from 'react'
import type { Exam } from '@jlpt/shared'
import { useExamStore } from '@/store/examStore'
import { Button } from '@/components/ui/Button'

interface QuestionNavProps {
  exam: Exam
  isLastSection: boolean
  onFinishSection: () => void
  onSubmit: () => void
}

export const QuestionNav = memo(function QuestionNav({
  exam,
  isLastSection,
  onFinishSection,
  onSubmit,
}: QuestionNavProps) {
  const position     = useExamStore(s => s.position)
  const answers      = useExamStore(s => s.answers)
  const flagged      = useExamStore(s => s.flagged)
  const visited      = useExamStore(s => s.visitedQuestions)
  const nextQuestion = useExamStore(s => s.nextQuestion)
  const prevQuestion = useExamStore(s => s.prevQuestion)
  const jumpTo       = useExamStore(s => s.jumpTo)
  const mode         = useExamStore(s => s.mode)

  const section  = exam.sections[position.sectionIndex]
  const group    = section.question_groups[position.groupIndex]
  const question = group.questions[position.questionIndex]
  const questionId = `${group.id}:${question.number}`

  // Previous is disabled at the very start, or when crossing section boundary in full_exam
  const isAtSectionStart = position.questionIndex === 0 && position.groupIndex === 0
  const isFirstEver      = isAtSectionStart && position.sectionIndex === 0
  const isPrevDisabled   = isFirstEver || (mode === 'full_exam' && isAtSectionStart)

  // Show group labels only for listening section (question numbers reset per group)
  const isListening   = section.type === 'listening'
  const sectionNumber = position.sectionIndex + 1

  return (
    <div className="space-y-4">
      {/* Question grid — grouped by もんだい with labels */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {section.question_groups.map((g, gIdx) => (
          <div key={g.id} className="contents">
            {/* Group label — only for listening where question numbers reset per group */}
            {isListening && (
              <span className="text-xs font-semibold text-accent font-sans tabular-nums w-7 text-right shrink-0">
                {sectionNumber}.{gIdx + 1}
              </span>
            )}

            {/* Questions in this group */}
            {g.questions.map((q, qIdx) => {
              const qId        = `${g.id}:${q.number}`
              const posKey     = `${position.sectionIndex}-${gIdx}-${qIdx}`
              const isAnswered = qId in answers
              const isFlagged  = flagged.has(qId)
              const isVisited  = visited.has(posKey)
              const isCurrent  = qId === questionId

              return (
                <button
                  key={qId}
                  onClick={() => jumpTo({
                    sectionIndex: position.sectionIndex,
                    groupIndex: gIdx,
                    questionIndex: qIdx,
                  })}
                  className={[
                    'w-8 h-8 rounded-lg text-xs font-semibold transition-all',
                    'border-2 focus:outline-none',
                    isCurrent  ? 'border-accent bg-accent text-white scale-110' :
                    isFlagged  ? 'border-warning bg-yellow-50 dark:bg-warning/15 text-warning' :
                    isAnswered ? 'border-success bg-green-50 dark:bg-success/15 text-success' :
                    isVisited  ? 'border-border bg-surface text-text-muted' :
                                 'border-border bg-bg text-text-muted',
                  ].join(' ')}
                  aria-label={`Question ${q.number}${isFlagged ? ' (flagged)' : ''}${isAnswered ? ' (answered)' : ''}`}
                >
                  {q.number}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-text-muted font-sans">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-50 dark:bg-success/15 border border-success inline-block" />
          Answered
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-50 dark:bg-warning/15 border border-warning inline-block" />
          Flagged
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-accent inline-block" />
          Current
        </span>
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 pt-2 border-t border-border">
        <Button
          variant="secondary"
          size="md"
          onClick={prevQuestion}
          disabled={isPrevDisabled}
        >
          ← Previous
        </Button>

        {isLastSection ? (
          <Button variant="danger" size="md" onClick={onSubmit}>
            Submit Exam
          </Button>
        ) : (
          <Button variant="secondary" size="md" onClick={onFinishSection}>
            Finish Section →
          </Button>
        )}

        <Button variant="primary" size="md" onClick={nextQuestion}>
          Next →
        </Button>
      </div>
    </div>
  )
})

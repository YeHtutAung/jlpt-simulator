import { memo } from 'react'
import type { Exam } from '@jlpt/shared'
import { useExamStore } from '@/store/examStore'
import { Button } from '@/components/ui/Button'

interface QuestionNavProps {
  exam: Exam
  onSubmit: () => void
}

export const QuestionNav = memo(function QuestionNav({ exam, onSubmit }: QuestionNavProps) {
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
  const questionId = `${position.sectionIndex}-${position.groupIndex}-${position.questionIndex}-${question.number}`

  // Flatten all questions for grid display
  const allQuestions = section.question_groups.flatMap((g, gIdx) =>
    g.questions.map((q, qIdx) => ({
      sectionIndex: position.sectionIndex,
      groupIndex: gIdx,
      questionIndex: qIdx,
      questionId: `${position.sectionIndex}-${gIdx}-${qIdx}-${q.number}`,
      number: q.number,
    }))
  )

  const isFirst = position.sectionIndex === 0
    && position.groupIndex === 0
    && position.questionIndex === 0

  return (
    <div className="space-y-4">
      {/* Question grid */}
      <div className="flex flex-wrap gap-2">
        {allQuestions.map(q => {
          const posKey = `${q.sectionIndex}-${q.groupIndex}-${q.questionIndex}`
          const isAnswered = q.questionId in answers
          const isFlagged  = flagged.has(q.questionId)
          const isVisited  = visited.has(posKey)
          const isCurrent  = q.questionId === questionId

          return (
            <button
              key={q.questionId}
              onClick={() => jumpTo({
                sectionIndex: q.sectionIndex,
                groupIndex: q.groupIndex,
                questionIndex: q.questionIndex,
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
          disabled={isFirst || mode === 'full_exam'}
        >
          ← Previous
        </Button>

        <Button
          variant="danger"
          size="md"
          onClick={onSubmit}
        >
          Submit Exam
        </Button>

        <Button
          variant="primary"
          size="md"
          onClick={nextQuestion}
        >
          Next →
        </Button>
      </div>
    </div>
  )
})

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useExamStore } from '@/store/examStore'
import { QuestionCard } from '@/components/exam/QuestionCard'
import { QuestionNav } from '@/components/exam/QuestionNav'
import { Timer } from '@/components/ui/Timer'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

const SECTION_LABELS: Record<string, string> = {
  vocabulary:      '文字・語彙',
  grammar_reading: '文法・読解',
  listening:       '聴解',
}

export function ExamSession() {
  const { examId } = useParams<{ examId: string }>()
  const navigate   = useNavigate()

  const exam         = useExamStore(s => s.exam)
  const position     = useExamStore(s => s.position)
  const answers      = useExamStore(s => s.answers)
  const flagged      = useExamStore(s => s.flagged)
  const mode         = useExamStore(s => s.mode)
  const attemptId    = useExamStore(s => s.attemptId)
  const isComplete   = useExamStore(s => s.isComplete)
  const isSubmitting = useExamStore(s => s.isSubmitting)
  const selectAnswer = useExamStore(s => s.selectAnswer)
  const toggleFlag   = useExamStore(s => s.toggleFlag)
  const submitExam   = useExamStore(s => s.submitExam)
  const resetExam    = useExamStore(s => s.resetExam)

  const [showSubmitModal, setShowSubmitModal] = useState(false)

  // Redirect if no exam loaded (e.g. page refresh)
  if (!exam) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-text-muted font-sans">No active exam session.</p>
          <Button onClick={() => navigate(`/exam/${examId}`)}>
            Return to Exam Select
          </Button>
        </div>
      </div>
    )
  }

  // Redirect when complete
  if (isComplete && attemptId) {
    resetExam()
    navigate(`/results/${attemptId}`)
    return null
  }

  const section  = exam.sections[position.sectionIndex]
  const group    = section.question_groups[position.groupIndex]
  const question = group.questions[position.questionIndex]

  const questionId = `${position.sectionIndex}-${position.groupIndex}-${position.questionIndex}-${question.number}`

  // Count total questions in section
  const totalInSection = section.question_groups
    .reduce((sum, g) => sum + g.questions.length, 0)

  // Count current question position across section
  let currentPos = 0
  for (let gi = 0; gi < position.groupIndex; gi++) {
    currentPos += section.question_groups[gi].questions.length
  }
  currentPos += position.questionIndex + 1

  const answeredCount = Object.keys(answers).length
  const flaggedCount  = flagged.size

  async function handleConfirmSubmit() {
    setShowSubmitModal(false)
    await submitExam()
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">

      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-text-muted font-sans uppercase tracking-wider">
                {exam.meta.level} · {exam.meta.year}
              </span>
              <h1 className="font-serif text-base font-semibold text-text">
                {SECTION_LABELS[section.type] ?? section.type}
              </h1>
            </div>
            <Timer mode={mode} />
          </div>
          <ProgressBar
            current={currentPos}
            total={totalInSection}
            answered={answeredCount}
            flagged={flaggedCount}
          />
        </div>
      </header>

      {/* Question area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <QuestionCard
          group={group}
          question={question}
          selectedOption={answers[questionId] ?? null}
          onSelect={(option) => selectAnswer(questionId, option)}
          isFlagged={flagged.has(questionId)}
          onToggleFlag={() => toggleFlag(questionId)}
          examMode={mode}
        />
      </main>

      {/* Bottom nav */}
      <footer className="sticky bottom-0 bg-surface border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <QuestionNav
            exam={exam}
            onSubmit={() => setShowSubmitModal(true)}
          />
        </div>
      </footer>

      {/* Submit confirmation modal */}
      <Modal
        open={showSubmitModal}
        title="Submit Exam?"
        confirmLabel="Submit"
        confirmVariant="danger"
        cancelLabel="Keep going"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowSubmitModal(false)}
        loading={isSubmitting}
      >
        <div className="space-y-2 text-sm">
          <p>You have answered <strong>{answeredCount}</strong> of{' '}
            <strong>{totalInSection}</strong> questions.</p>
          {totalInSection - answeredCount > 0 && (
            <p className="text-warning">
              ⚠ {totalInSection - answeredCount} questions unanswered.
            </p>
          )}
          {flaggedCount > 0 && (
            <p className="text-warning">⚑ {flaggedCount} questions flagged for review.</p>
          )}
          <p className="text-text-muted">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  )
}

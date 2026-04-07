import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useExamStore } from '@/store/examStore'
import { QuestionCard } from '@/components/exam/QuestionCard'
import { QuestionNav } from '@/components/exam/QuestionNav'
import { Timer } from '@/components/ui/Timer'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const SECTION_LABELS: Record<string, string> = {
  vocabulary:      '文字・語彙',
  grammar_reading: '文法・読解',
  listening:       '聴解',
}

export function ExamSession() {
  const { examId } = useParams<{ examId: string }>()
  const navigate   = useNavigate()

  const exam              = useExamStore(s => s.exam)
  const position          = useExamStore(s => s.position)
  const answers           = useExamStore(s => s.answers)
  const flagged           = useExamStore(s => s.flagged)
  const mode              = useExamStore(s => s.mode)
  const attemptId         = useExamStore(s => s.attemptId)
  const isSectionComplete = useExamStore(s => s.isSectionComplete)
  const isComplete        = useExamStore(s => s.isComplete)
  const isSubmitted       = useExamStore(s => s.isSubmitted)
  const isSubmitting      = useExamStore(s => s.isSubmitting)
  const selectAnswer      = useExamStore(s => s.selectAnswer)
  const toggleFlag        = useExamStore(s => s.toggleFlag)
  const nextQuestion      = useExamStore(s => s.nextQuestion)
  const prevQuestion      = useExamStore(s => s.prevQuestion)
  const advanceSection    = useExamStore(s => s.advanceSection)
  const submitExam        = useExamStore(s => s.submitExam)
  const resetExam         = useExamStore(s => s.resetExam)

  const [showSectionModal, setShowSectionModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal]   = useState(false)
  const toast = useToast()

  // ── Keyboard navigation ──────────────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (showSubmitModal || showSectionModal) return
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

    switch (e.key) {
      case '1': case '2': case '3': case '4': {
        const option = parseInt(e.key, 10)
        if (!exam) return
        const s = exam.sections[position.sectionIndex]
        const g = s.question_groups[position.groupIndex]
        const q = g.questions[position.questionIndex]
        const qId = `${g.id}:${q.number}`
        if (option <= q.options.length) {
          selectAnswer(qId, option)
          toast.info(`Answer ${option} selected`, 1200)
        }
        break
      }
      case 'n': case 'N': case 'ArrowRight':
        nextQuestion()
        break
      case 'p': case 'P': case 'ArrowLeft':
        if (mode === 'practice') prevQuestion()
        break
      case 'f': case 'F': {
        if (!exam) return
        const s = exam.sections[position.sectionIndex]
        const g = s.question_groups[position.groupIndex]
        const q = g.questions[position.questionIndex]
        toggleFlag(`${g.id}:${q.number}`)
        break
      }
    }
  }, [showSubmitModal, showSectionModal, exam, position, mode, selectAnswer, nextQuestion, prevQuestion, toggleFlag, toast])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Section complete (non-last section) → show section advance modal
  useEffect(() => {
    if (isSectionComplete) {
      setShowSectionModal(true)
    }
  }, [isSectionComplete])

  // Last section complete → show submit modal
  useEffect(() => {
    if (isComplete && !isSubmitted) {
      setShowSubmitModal(true)
    }
  }, [isComplete, isSubmitted])

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

  // Navigate to results only after the Edge Function confirms submission
  if (isSubmitted && attemptId) {
    resetExam()
    navigate(`/results/${attemptId}`)
    return null
  }

  const section  = exam.sections[position.sectionIndex]
  const group    = section.question_groups[position.groupIndex]
  const question = group.questions[position.questionIndex]

  const questionId = `${group.id}:${question.number}`

  const isLastSection = position.sectionIndex === exam.sections.length - 1
  const nextSection   = !isLastSection ? exam.sections[position.sectionIndex + 1] : null

  // Count total questions in section
  const totalInSection = section.question_groups
    .reduce((sum, g) => sum + g.questions.length, 0)

  // Count current question position across section
  let currentPos = 0
  for (let gi = 0; gi < position.groupIndex; gi++) {
    currentPos += section.question_groups[gi].questions.length
  }
  currentPos += position.questionIndex + 1

  // Count answered questions in current section only
  const sectionQuestionNumbers = section.question_groups
    .flatMap(g => g.questions.map(q => `${g.id}:${q.number}`))
  const answeredInSection = sectionQuestionNumbers.filter(id => id in answers).length
  const flaggedInSection  = sectionQuestionNumbers.filter(id => flagged.has(id)).length

  async function handleConfirmSubmit() {
    setShowSubmitModal(false)
    try {
      await submitExam()
      toast.success('Exam submitted successfully!')
    } catch {
      toast.error('Failed to submit exam. Please try again.')
    }
  }

  function handleConfirmAdvance() {
    setShowSectionModal(false)
    advanceSection()
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
                {' · '}Section {position.sectionIndex + 1}/{exam.sections.length}
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
            answered={answeredInSection}
            flagged={flaggedInSection}
          />
        </div>
      </header>

      {/* Question area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-5">
        {/* もんだい header */}
        <h2 className="font-japanese text-lg font-semibold text-text">
          もんだい{position.groupIndex + 1}
        </h2>

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
            isLastSection={isLastSection}
            onFinishSection={() => setShowSectionModal(true)}
            onSubmit={() => setShowSubmitModal(true)}
          />
        </div>
      </footer>

      {/* Keyboard hint bar */}
      <div className="border-t border-border bg-bg py-1.5">
        <div className="max-w-3xl mx-auto px-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-text-muted font-sans">
          <span><kbd className="kbd">1</kbd>–<kbd className="kbd">4</kbd> Select</span>
          <span><kbd className="kbd">N</kbd> / <kbd className="kbd">→</kbd> Next</span>
          {mode === 'practice' && <span><kbd className="kbd">P</kbd> / <kbd className="kbd">←</kbd> Prev</span>}
          <span><kbd className="kbd">F</kbd> Flag</span>
        </div>
      </div>

      {/* Section complete modal */}
      <Modal
        open={showSectionModal}
        title={`${SECTION_LABELS[section.type] ?? 'Section'} Complete`}
        confirmLabel={nextSection ? `Proceed to ${SECTION_LABELS[nextSection.type] ?? 'Next Section'} →` : 'Submit Exam'}
        cancelLabel={mode === 'practice' ? 'Keep reviewing' : undefined}
        onConfirm={handleConfirmAdvance}
        onCancel={mode === 'practice' ? () => setShowSectionModal(false) : undefined}
      >
        <div className="space-y-2 text-sm">
          <p>You have answered <strong>{answeredInSection}</strong> of{' '}
            <strong>{totalInSection}</strong> questions in this section.</p>
          {totalInSection - answeredInSection > 0 && (
            <p className="text-warning">
              ⚠ {totalInSection - answeredInSection} questions unanswered.
            </p>
          )}
          {flaggedInSection > 0 && (
            <p className="text-warning">⚑ {flaggedInSection} questions flagged for review.</p>
          )}
          {mode === 'full_exam' && (
            <p className="text-text-muted">
              Once you proceed, you cannot return to this section.
            </p>
          )}
        </div>
      </Modal>

      {/* Submit exam modal */}
      <Modal
        open={showSubmitModal}
        title="Submit Exam?"
        confirmLabel="Submit"
        confirmVariant="danger"
        cancelLabel="Keep reviewing"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowSubmitModal(false)}
        loading={isSubmitting}
      >
        <div className="space-y-2 text-sm">
          <p>You have answered <strong>{answeredInSection}</strong> of{' '}
            <strong>{totalInSection}</strong> questions in this section.</p>
          {totalInSection - answeredInSection > 0 && (
            <p className="text-warning">
              ⚠ {totalInSection - answeredInSection} questions unanswered.
            </p>
          )}
          {flaggedInSection > 0 && (
            <p className="text-warning">⚑ {flaggedInSection} questions flagged for review.</p>
          )}
          <p className="text-text-muted">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  )
}

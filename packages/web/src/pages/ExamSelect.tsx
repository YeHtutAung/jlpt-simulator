import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { supabase } from '@/lib/supabase'
import { useExamStore } from '@/store/examStore'
import { useAuthStore } from '@/store/authStore'
import { LEVEL_CONFIGS } from '@jlpt/shared'
import type { Exam, ExamMode } from '@jlpt/shared'

export function ExamSelect() {
  const { examId }   = useParams<{ examId: string }>()
  const navigate     = useNavigate()
  const user         = useAuthStore(s => s.user)
  const initExam     = useExamStore(s => s.initExam)

  const [selectedMode, setSelectedMode] = useState<ExamMode | null>(null)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [starting,     setStarting]     = useState(false)

  const { data: examMeta, isLoading } = useQuery({
    queryKey: ['exam-meta', examId],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('id, level, year, month, source_json')
        .eq('id', examId)
        .single()
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!examId,
  })

  async function handleStart() {
    if (!selectedMode || !examMeta || !user) return
    setStarting(true)

    try {
      // Create attempt record
      const { data: attempt, error } = await supabase
        .from('attempts')
        .insert({
          user_id: user.id,
          exam_id: examId,
          mode: selectedMode,
          status: 'in_progress',
        })
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Init exam store with full JSON
      const exam = examMeta.source_json as Exam
      initExam(exam, selectedMode, attempt.id)

      navigate(`/exam/${examId}/session`)
    } catch (err) {
      console.error('Failed to start exam:', err)
      setStarting(false)
      setShowConfirm(false)
    }
  }

  const levelConfig = examMeta
    ? LEVEL_CONFIGS[examMeta.level]
    : null

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-surface rounded-xl border
                                       border-border animate-pulse" />
            ))}
          </div>
        ) : examMeta ? (
          <div className="space-y-8 animate-fade-in">

            {/* Exam title */}
            <div>
              <span className="text-primary font-sans text-sm font-medium
                               uppercase tracking-widest">
                {examMeta.level} · {examMeta.year} · {examMeta.month}
              </span>
              <h1 className="font-serif text-3xl font-bold text-text mt-1">
                Choose Your Mode
              </h1>
            </div>

            {/* Exam info */}
            {levelConfig && (
              <div className="bg-surface rounded-xl border border-border p-5">
                <h2 className="font-sans font-semibold text-text mb-3">
                  Exam Structure
                </h2>
                <div className="space-y-2">
                  {levelConfig.sections.map((s, i) => (
                    <div key={i} className="flex justify-between text-sm font-sans">
                      <span className="text-text">{s.label_en}</span>
                      <span className="text-text-muted">{s.time_limit} min</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between
                                   text-sm font-semibold font-sans">
                    <span>Total</span>
                    <span>{levelConfig.total_time} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Mode cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  {
                    mode: 'full_exam' as ExamMode,
                    title: 'Full Exam',
                    titleJa: '本番モード',
                    description: 'Timed, strict — just like the real test. No going back, no hints.',
                    icon: '⏱',
                    color: 'border-primary',
                  },
                  {
                    mode: 'practice' as ExamMode,
                    title: 'Practice Mode',
                    titleJa: '練習モード',
                    description: 'Relaxed pace. Skip questions, flag for review, get hints.',
                    icon: '📖',
                    color: 'border-accent',
                  },
                ] as const
              ).map(({ mode, title, titleJa, description, icon, color }) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={[
                    'text-left p-5 rounded-xl border-2 transition-all duration-150',
                    'focus:outline-none hover:shadow-md',
                    selectedMode === mode
                      ? `${color} bg-surface shadow-md scale-[1.02]`
                      : 'border-border bg-surface hover:border-text-muted',
                  ].join(' ')}
                >
                  <span className="text-2xl block mb-2">{icon}</span>
                  <p className="font-serif font-semibold text-lg text-text">{title}</p>
                  <p className="text-xs font-japanese text-text-muted mb-2">{titleJa}</p>
                  <p className="text-sm text-text-muted font-sans leading-relaxed">
                    {description}
                  </p>
                </button>
              ))}
            </div>

            {/* Start button */}
            <Button
              size="lg"
              className="w-full"
              disabled={!selectedMode}
              onClick={() => setShowConfirm(true)}
            >
              {selectedMode
                ? `Start ${selectedMode === 'full_exam' ? 'Full Exam' : 'Practice'} →`
                : 'Select a mode to continue'}
            </Button>
          </div>
        ) : (
          <p className="text-center text-text-muted font-sans py-16">
            Exam not found.
          </p>
        )}
      </main>

      {/* Confirm modal */}
      <Modal
        open={showConfirm}
        title={selectedMode === 'full_exam' ? 'Start Full Exam?' : 'Start Practice?'}
        confirmLabel="Start Now"
        cancelLabel="Not yet"
        onConfirm={handleStart}
        onCancel={() => setShowConfirm(false)}
        loading={starting}
      >
        {selectedMode === 'full_exam' ? (
          <p>
            The timer will start immediately. You cannot pause or go back.
            Make sure you have <strong>{levelConfig?.total_time} minutes</strong> available.
          </p>
        ) : (
          <p>
            Practice mode — no time pressure. You can skip questions,
            flag them for review, and come back anytime.
          </p>
        )}
      </Modal>
    </div>
  )
}

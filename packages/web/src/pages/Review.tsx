import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { ReviewCard } from '@/components/results/ReviewCard'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import type { ReviewQuestion } from '@jlpt/shared'

type FilterType = 'all' | 'wrong' | 'flagged'

interface RawQuestionRow {
  question_groups?: { sections?: { type?: string } }
  options?: { number: number; text: string }[]
  question_number?: number
  question_text?: string
  correct_answer?: number
  explanation?: string
}

const SECTION_LABELS: Record<string, string> = {
  vocabulary:      'Vocabulary (文字・語彙)',
  grammar_reading: 'Grammar & Reading (文法・読解)',
  listening:       'Listening (聴解)',
}

export function Review() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const [filter, setFilter] = useState<FilterType>('all')
  const [activeSection, setActiveSection] = useState<string>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['attempt-review', attemptId],
    queryFn: async () => {
      // Fetch user_answers joined with question data
      const { data, error } = await supabase
        .from('user_answers')
        .select(`
          selected_option, is_correct, time_spent, flagged,
          questions (
            question_number, question_text, options,
            correct_answer, explanation,
            question_groups ( group_type, section_id,
              sections ( type )
            )
          )
        `)
        .eq('attempt_id', attemptId)
        .order('questions(question_number)')

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!attemptId,
  })

  // Group by section type
  const grouped = (data ?? []).reduce<Record<string, ReviewQuestion[]>>((acc, row) => {
    const q    = row.questions as RawQuestionRow
    const sec  = q?.question_groups?.sections?.type ?? 'unknown'
    const opts = (q?.options ?? []) as { number: number; text: string }[]

    const rq: ReviewQuestion = {
      question_number: q?.question_number ?? 0,
      question_text:   q?.question_text ?? '',
      options:         opts,
      correct_answer:  q?.correct_answer ?? 0,
      selected_answer: row.selected_option ?? 0,
      is_correct:      row.is_correct ?? false,
      explanation:     q?.explanation ?? undefined,
      flagged:         row.flagged ?? false,
      time_spent:      row.time_spent ?? 0,
    }

    if (!acc[sec]) acc[sec] = []
    acc[sec].push(rq)
    return acc
  }, {})

  const sections = Object.keys(grouped)

  function filterQuestions(qs: ReviewQuestion[]) {
    return qs.filter(q =>
      filter === 'all'    ? true :
      filter === 'wrong'  ? !q.is_correct :
      filter === 'flagged' ? q.flagged : true
    )
  }

  const displaySections = activeSection === 'all'
    ? sections
    : sections.filter(s => s === activeSection)

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-text">
            Answer Review
          </h1>
          <Link to={`/results/${attemptId}`}>
            <Button variant="secondary" size="sm">← Results</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Section filter */}
          <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl">
            <button
              onClick={() => setActiveSection('all')}
              className={[
                'px-3 py-1 rounded-lg text-xs font-sans font-medium transition-colors',
                activeSection === 'all'
                  ? 'bg-text text-surface'
                  : 'text-text-muted hover:text-text',
              ].join(' ')}
            >
              All
            </button>
            {sections.map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={[
                  'px-3 py-1 rounded-lg text-xs font-sans font-medium transition-colors',
                  activeSection === s
                    ? 'bg-text text-surface'
                    : 'text-text-muted hover:text-text',
                ].join(' ')}
              >
                {s === 'vocabulary' ? 'Vocab' :
                 s === 'grammar_reading' ? 'Grammar' : 'Listen'}
              </button>
            ))}
          </div>

          {/* Answer filter */}
          <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl">
            {(['all', 'wrong', 'flagged'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  'px-3 py-1 rounded-lg text-xs font-sans font-medium transition-colors capitalize',
                  filter === f
                    ? 'bg-text text-surface'
                    : 'text-text-muted hover:text-text',
                ].join(' ')}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Questions by section */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-surface rounded-xl border
                                       border-border animate-pulse" />
            ))}
          </div>
        ) : (
          displaySections.map(sectionType => {
            const questions = filterQuestions(grouped[sectionType] ?? [])
            if (questions.length === 0) return null

            return (
              <section key={sectionType} className="space-y-4">
                <h2 className="font-serif text-lg font-semibold text-text
                                sticky top-[57px] bg-bg py-2 z-10">
                  {SECTION_LABELS[sectionType] ?? sectionType}
                  <span className="text-sm text-text-muted font-sans ml-2">
                    ({questions.filter(q => q.is_correct).length}/{questions.length} correct)
                  </span>
                </h2>

                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <ReviewCard key={q.question_number} question={q} index={i} />
                  ))}
                </div>
              </section>
            )
          })
        )}

        {/* Bottom action */}
        <div className="pt-4 border-t border-border">
          <Link to="/">
            <Button size="lg" className="w-full">
              Try Another Paper
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

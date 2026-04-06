import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { ScoreCircle } from '@/components/results/ScoreCircle'
import { SectionBreakdown } from '@/components/results/SectionBreakdown'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import type { AttemptScoreJson } from '@jlpt/shared'

export function Results() {
  const { attemptId } = useParams<{ attemptId: string }>()

  const { data, isLoading } = useQuery({
    queryKey: ['attempt-results', attemptId],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attempts')
        .select(`
          id, mode, completed_at, score_json,
          exams ( level, year, month )
        `)
        .eq('id', attemptId)
        .single()
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!attemptId,
  })

  const score  = data?.score_json as AttemptScoreJson | null
  const exam   = data?.exams as unknown as { level: string; year: number; month: string } | null
  const isPassing = (score?.total_percentage ?? 0) >= 60

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-48 bg-surface rounded-2xl border border-border animate-pulse" />
            <div className="h-48 bg-surface rounded-2xl border border-border animate-pulse" />
          </div>
        ) : data && score ? (
          <div className="space-y-8 animate-fade-in">

            {/* Header */}
            <div className="text-center">
              <span className="text-primary font-sans text-sm font-medium
                               uppercase tracking-widest">
                {exam?.level} · {exam?.year} · {exam?.month}
              </span>
              <h1 className="font-serif text-3xl font-bold text-text mt-1">
                {data.mode === 'full_exam' ? 'Exam Results' : 'Practice Results'}
              </h1>
            </div>

            {/* Score card */}
            <div className="bg-surface rounded-2xl border border-border p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <ScoreCircle
                  percentage={score.total_percentage}
                  size={180}
                />
                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <p className="text-4xl font-bold font-serif text-text">
                      {score.total_correct}
                      <span className="text-xl text-text-muted font-sans">
                        /{score.total_questions}
                      </span>
                    </p>
                    <p className="text-text-muted font-sans text-sm">
                      correct answers
                    </p>
                  </div>

                  <div className={[
                    'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                    'text-sm font-semibold font-sans',
                    isPassing
                      ? 'bg-green-100 dark:bg-success/20 text-success'
                      : 'bg-red-100 dark:bg-error/20 text-error',
                  ].join(' ')}>
                    {isPassing ? '🎉 Passing Score' : '📚 Keep Studying'}
                  </div>

                  {data.completed_at && (
                    <p className="text-xs text-text-muted font-sans">
                      Completed {new Date(data.completed_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section breakdown */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <SectionBreakdown sections={score.sections} />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={`/review/${attemptId}`} className="flex-1">
                <Button variant="secondary" size="lg" className="w-full">
                  Review Answers
                </Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button size="lg" className="w-full">
                  Try Another Paper
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center text-text-muted font-sans py-16">
            Results not found.
          </p>
        )}
      </main>
    </div>
  )
}

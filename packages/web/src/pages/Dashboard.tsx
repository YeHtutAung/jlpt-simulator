import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { DashboardSkeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { AttemptScoreJson } from '@jlpt/shared'

export function Dashboard() {
  const user = useAuthStore(s => s.user)

  const { data: attempts = [], isLoading } = useQuery({
    queryKey: ['user-attempts', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attempts')
        .select(`
          id, mode, status, started_at, completed_at, score_json,
          exams ( level, year, month )
        `)
        .eq('user_id', user!.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(20)

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!user,
  })

  // Compute quick stats
  const totalAttempts = attempts.length
  const avgScore = totalAttempts > 0
    ? Math.round(
        attempts.reduce((sum, a) => {
          const s = a.score_json as AttemptScoreJson | null
          return sum + (s?.total_percentage ?? 0)
        }, 0) / totalAttempts
      )
    : 0
  const bestScore = totalAttempts > 0
    ? Math.max(...attempts.map(a => {
        const s = a.score_json as AttemptScoreJson | null
        return s?.total_percentage ?? 0
      }))
    : 0

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">

        {isLoading ? (
          <DashboardSkeleton />
        ) : (
          <>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-text">
              Welcome back, {user?.display_name}
            </h1>
            <p className="text-text-muted font-sans text-sm mt-1">
              Your practice history
            </p>
          </div>
          <Link to="/">
            <Button size="md">Find a Paper</Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Attempts',   value: totalAttempts, suffix: '' },
            { label: 'Avg Score',  value: avgScore,      suffix: '%' },
            { label: 'Best Score', value: bestScore,     suffix: '%' },
          ].map(stat => (
            <div key={stat.label}
              className="bg-surface rounded-xl border border-border p-5 text-center">
              <p className="font-serif text-3xl font-bold text-text">
                {stat.value}{stat.suffix}
              </p>
              <p className="text-xs text-text-muted font-sans mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent attempts */}
        <div>
          <h2 className="font-serif text-xl font-semibold text-text mb-4">
            Recent Attempts
          </h2>

          {attempts.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-4xl">📝</p>
              <p className="text-text-muted font-sans">
                No attempts yet. Start with a paper!
              </p>
              <Link to="/">
                <Button>Browse Papers</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.map(attempt => {
                const score = attempt.score_json as AttemptScoreJson | null
                const exam  = attempt.exams as unknown as { level: string; year: number; month: string } | null
                const pct   = score?.total_percentage ?? 0
                const color = pct >= 80 ? 'text-success' : pct >= 60 ? 'text-accent' : 'text-error'

                return (
                  <div key={attempt.id}
                    className="bg-surface rounded-xl border border-border p-4
                               flex items-center justify-between gap-4
                               hover:border-accent transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full
                                       bg-bg border border-border text-text-muted">
                        {exam?.level}
                      </span>
                      <div>
                        <p className="font-sans font-medium text-text text-sm">
                          {exam?.year} · {exam?.month}
                        </p>
                        <p className="text-xs text-text-muted font-sans capitalize">
                          {attempt.mode.replace('_', ' ')} ·{' '}
                          {attempt.completed_at
                            ? new Date(attempt.completed_at).toLocaleDateString()
                            : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`font-serif text-2xl font-bold ${color}`}>
                        {pct}%
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/results/${attempt.id}`}>
                          <Button variant="ghost" size="sm">Results</Button>
                        </Link>
                        <Link to={`/review/${attempt.id}`}>
                          <Button variant="secondary" size="sm">Review</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
          </>
        )}
      </main>
    </div>
  )
}

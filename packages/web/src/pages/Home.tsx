import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { ExamCardSkeleton } from '@/components/ui/Skeleton'
import { supabase } from '@/lib/supabase'
import { JLPT_LEVELS } from '@jlpt/shared'
import { useState } from 'react'

interface ExamRow {
  id: string
  level: string
  year: number
  month: string
  status: string
}

const LEVEL_COLORS: Record<string, string> = {
  N1: 'bg-red-100 text-red-700 border-red-200',
  N2: 'bg-orange-100 text-orange-700 border-orange-200',
  N3: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  N4: 'bg-green-100 text-green-700 border-green-200',
  N5: 'bg-blue-100 text-blue-700 border-blue-200',
}

export function Home() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all')

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['exams', selectedLevel],
    queryFn: async () => {
      let query = supabase
        .from('exams')
        .select('id, level, year, month, status')
        .eq('status', 'published')
        .order('level')
        .order('year', { ascending: false })

      if (selectedLevel !== 'all') {
        query = query.eq('level', selectedLevel)
      }

      const { data, error } = await query
      if (error) throw new Error(error.message)
      return data as ExamRow[]
    },
  })

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-primary font-sans text-sm font-medium tracking-widest
                       uppercase mb-3">
          日本語能力試験
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-text mb-4">
          JLPT Simulator
        </h1>
        <p className="text-text-muted font-sans text-lg max-w-xl mx-auto mb-8">
          Practice with real past papers. N1 to N5, timed exam mode
          or relaxed practice mode.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/register">
            <Button size="lg">Start Practicing</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">Sign In</Button>
          </Link>
        </div>
      </section>

      {/* Level filter */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-text">
            Available Papers
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedLevel('all')}
              className={[
                'px-3 py-1.5 rounded-full text-sm font-sans font-medium',
                'border transition-colors',
                selectedLevel === 'all'
                  ? 'bg-text text-surface border-text'
                  : 'bg-surface text-text-muted border-border hover:border-text',
              ].join(' ')}
            >
              All
            </button>
            {JLPT_LEVELS.map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={[
                  'px-3 py-1.5 rounded-full text-sm font-sans font-medium',
                  'border transition-colors',
                  selectedLevel === level
                    ? 'bg-text text-surface border-text'
                    : 'bg-surface text-text-muted border-border hover:border-text',
                ].join(' ')}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Exam grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <ExamCardSkeleton key={i} />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-16 text-text-muted font-sans">
            <p className="text-4xl mb-3">📄</p>
            <p>No papers available yet for this level.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {exams.map(exam => (
              <Link key={exam.id} to={`/exam/${exam.id}`}>
                <div className="bg-surface rounded-xl border border-border p-5
                                 hover:border-accent hover:shadow-md transition-all
                                 group cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <span className={[
                      'text-xs font-bold px-2.5 py-1 rounded-full border',
                      LEVEL_COLORS[exam.level] ?? '',
                    ].join(' ')}>
                      {exam.level}
                    </span>
                    <span className="text-xs text-text-muted font-sans capitalize">
                      {exam.month}
                    </span>
                  </div>
                  <p className="font-serif text-2xl font-bold text-text mb-1">
                    {exam.year}
                  </p>
                  <p className="text-sm text-text-muted font-sans">
                    Past paper
                  </p>
                  <p className="text-xs text-primary font-sans mt-3
                                 group-hover:underline">
                    Start exam →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

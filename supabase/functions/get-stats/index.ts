import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ================================
// Edge Function: get-stats
// GET /functions/v1/get-stats
// Returns authenticated user's performance statistics
// ================================

interface SectionScore {
  section_type: string
  correct: number
  total: number
  percentage: number
  time_spent: number
}

interface AttemptScore {
  total_correct: number
  total_questions: number
  total_percentage: number
  sections: SectionScore[]
  completed_at: string
}

interface AttemptRow {
  id: string
  exam_id: string
  mode: string
  status: string
  started_at: string
  completed_at: string | null
  score_json: AttemptScore | null
  exams: {
    level: string
    year: number
    month: string
  }
}

interface WeakSection {
  section_type: string
  average_percentage: number
  attempt_count: number
}

interface LevelStat {
  level: string
  attempt_count: number
  average_percentage: number
  best_percentage: number
}

interface TrendPoint {
  attempt_id: string
  exam_level: string
  completed_at: string
  percentage: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    })
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch all completed attempts for this user with exam metadata
    const { data: attempts, error: attemptsErr } = await supabase
      .from('attempts')
      .select(`
        id,
        exam_id,
        mode,
        status,
        started_at,
        completed_at,
        score_json,
        exams ( level, year, month )
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })

    if (attemptsErr) {
      return new Response(JSON.stringify({ error: 'Failed to fetch attempts' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const rows = (attempts ?? []) as unknown as AttemptRow[]

    if (rows.length === 0) {
      return new Response(JSON.stringify({
        stats: {
          total_attempts: 0,
          average_score: 0,
          best_score: 0,
          by_level: [],
          recent_trend: [],
          weak_sections: [],
        },
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // ── Total attempts ─────────────────────────────────────
    const totalAttempts = rows.length

    // ── Average and best score ─────────────────────────────
    const percentages = rows
      .map((r) => r.score_json?.total_percentage ?? 0)

    const averageScore = Math.round(
      percentages.reduce((sum, p) => sum + p, 0) / percentages.length
    )
    const bestScore = Math.max(...percentages)

    // ── By level ───────────────────────────────────────────
    const levelMap = new Map<string, { total: number; best: number; count: number }>()
    for (const row of rows) {
      const level = row.exams.level
      const pct   = row.score_json?.total_percentage ?? 0
      const existing = levelMap.get(level) ?? { total: 0, best: 0, count: 0 }
      levelMap.set(level, {
        total: existing.total + pct,
        best:  Math.max(existing.best, pct),
        count: existing.count + 1,
      })
    }

    const byLevel: LevelStat[] = Array.from(levelMap.entries()).map(([level, s]) => ({
      level,
      attempt_count:       s.count,
      average_percentage:  Math.round(s.total / s.count),
      best_percentage:     s.best,
    }))

    // ── Recent trend (last 10 completed attempts) ──────────
    const recentTrend: TrendPoint[] = rows.slice(0, 10).map((r) => ({
      attempt_id:   r.id,
      exam_level:   r.exams.level,
      completed_at: r.completed_at ?? r.started_at,
      percentage:   r.score_json?.total_percentage ?? 0,
    }))

    // ── Weak sections ──────────────────────────────────────
    // Aggregate per section_type across all attempts
    const sectionMap = new Map<string, { total: number; count: number }>()
    for (const row of rows) {
      for (const section of row.score_json?.sections ?? []) {
        const existing = sectionMap.get(section.section_type) ?? { total: 0, count: 0 }
        sectionMap.set(section.section_type, {
          total: existing.total + section.percentage,
          count: existing.count + 1,
        })
      }
    }

    const weakSections: WeakSection[] = Array.from(sectionMap.entries())
      .map(([section_type, s]) => ({
        section_type,
        average_percentage: Math.round(s.total / s.count),
        attempt_count:      s.count,
      }))
      .sort((a, b) => a.average_percentage - b.average_percentage)

    return new Response(JSON.stringify({
      stats: {
        total_attempts: totalAttempts,
        average_score:  averageScore,
        best_score:     bestScore,
        by_level:       byLevel,
        recent_trend:   recentTrend,
        weak_sections:  weakSections,
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

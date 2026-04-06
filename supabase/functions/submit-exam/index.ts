import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SubmitPayload {
  attemptId: string
  answers: Record<string, number>      // questionId → selected option
  flagged: string[]
  timeSpent: Record<string, number>    // questionId → seconds
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
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

    const payload: SubmitPayload = await req.json()
    const { attemptId, answers, flagged, timeSpent } = payload

    // Verify attempt belongs to this user
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .select('id, user_id, exam_id, status')
      .eq('id', attemptId)
      .eq('user_id', user.id)
      .single()

    if (attemptError || !attempt) {
      return new Response(JSON.stringify({ error: 'Attempt not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (attempt.status === 'completed') {
      return new Response(JSON.stringify({ error: 'Already submitted' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch all questions for this exam with correct answers
    const { data: sections } = await supabase
      .from('sections')
      .select(`
        type,
        question_groups (
          questions ( id, question_number, correct_answer )
        )
      `)
      .eq('exam_id', attempt.exam_id)

    if (!sections) {
      return new Response(JSON.stringify({ error: 'Questions not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Build answer records and calculate scores
    const userAnswerRows: object[] = []
    const sectionScores: Record<string, { correct: number; total: number; time: number }> = {}

    for (const section of sections) {
      const sType = section.type as string
      if (!sectionScores[sType]) {
        sectionScores[sType] = { correct: 0, total: 0, time: 0 }
      }

      for (const group of (section.question_groups as any[]) ?? []) {
        for (const question of (group.questions as any[]) ?? []) {
          const qId          = question.id as string
          const selectedOpt  = answers[qId] ?? null
          const isCorrect    = selectedOpt === question.correct_answer
          const spent        = timeSpent[qId] ?? 0
          const isFlagged    = flagged.includes(qId)

          sectionScores[sType].total++
          sectionScores[sType].time += spent
          if (isCorrect) sectionScores[sType].correct++

          userAnswerRows.push({
            attempt_id:      attemptId,
            question_id:     qId,
            selected_option: selectedOpt,
            is_correct:      isCorrect,
            time_spent:      spent,
            flagged:         isFlagged,
          })
        }
      }
    }

    // Upsert all user answers
    await supabase.from('user_answers').upsert(userAnswerRows)

    // Build score_json
    const sectionScoreArray = Object.entries(sectionScores).map(([type, s]) => ({
      section_type: type,
      correct:      s.correct,
      total:        s.total,
      percentage:   s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
      time_spent:   s.time,
    }))

    const totalCorrect   = sectionScoreArray.reduce((sum, s) => sum + s.correct, 0)
    const totalQuestions = sectionScoreArray.reduce((sum, s) => sum + s.total, 0)

    const scoreJson = {
      total_correct:    totalCorrect,
      total_questions:  totalQuestions,
      total_percentage: totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0,
      sections:     sectionScoreArray,
      completed_at: new Date().toISOString(),
    }

    // Update attempt as completed
    await supabase
      .from('attempts')
      .update({
        status:       'completed',
        completed_at: new Date().toISOString(),
        score_json:   scoreJson,
      })
      .eq('id', attemptId)

    return new Response(JSON.stringify({ success: true, score: scoreJson }), {
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

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

interface SubmitPayload {
  attemptId: string
  answers: Record<string, number>      // question.number (string) → selected option
  flagged: string[]                    // question.number strings
  timeSpent: Record<string, number>    // question.number (string) → seconds
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Auth check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return json({ error: 'Unauthorized' }, 401)
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
      return json({ error: 'Attempt not found' }, 404)
    }

    if (attempt.status === 'completed') {
      return json({ error: 'Already submitted' }, 400)
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
      return json({ error: 'Questions not found' }, 404)
    }

    // Build answer records and calculate scores
    const userAnswerRows: object[] = []
    const sectionScores: Record<string, { correct: number; total: number; time: number }> = {}

    for (const section of sections) {
      const sType = section.type as string
      if (!sectionScores[sType]) {
        sectionScores[sType] = { correct: 0, total: 0, time: 0 }
      }

      for (const group of (section.question_groups as unknown[]) ?? []) {
        for (const question of ((group as { questions: unknown[] }).questions) ?? []) {
          const q            = question as { id: string; question_number: number; correct_answer: number }
          // Client keys answers by question_number (as string) — same as question.number on the frontend
          const qKey         = String(q.question_number)
          const selectedOpt  = answers[qKey] ?? null
          const isCorrect    = selectedOpt === q.correct_answer
          const spent        = timeSpent[qKey] ?? 0
          const isFlagged    = flagged.includes(qKey)

          sectionScores[sType].total++
          sectionScores[sType].time += spent
          if (isCorrect) sectionScores[sType].correct++

          userAnswerRows.push({
            attempt_id:      attemptId,
            question_id:     q.id,
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

    return json({ success: true, score: scoreJson }, 200)

  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Server error' }, 500)
  }
})

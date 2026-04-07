import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ================================
// Edge Function: get-exam
// GET /functions/v1/get-exam?examId=<uuid>
// Returns full exam structure excluding correct_answer (security)
// ================================

interface QuestionRow {
  id: string
  question_number: number
  question_text: string
  underline_word: string | null
  options: Array<{ number: number; text: string; image_type?: string; image_data?: string }>
  explanation: string | null
  order_index: number
  image_type: string | null
  image_data: string | null
  image_alt: string | null
  image_position: string | null
  passage_id: string | null
}

interface PassageRow {
  id: string
  label: string | null
  passage_text: string
  order_index: number
}

interface GroupRow {
  id: string
  group_key: string
  group_type: string
  instructions: string | null
  passage_text: string | null
  image_type: string | null
  image_data: string | null
  image_alt: string | null
  audio_url: string | null
  order_index: number
  questions: QuestionRow[]
  group_passages: PassageRow[]
}

interface SectionRow {
  id: string
  type: string
  time_limit: number
  instructions: string | null
  order_index: number
  question_groups: GroupRow[]
}

interface ExamRow {
  id: string
  level: string
  year: number
  month: string
  status: string
  sections: SectionRow[]
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

    // Auth check — user must be logged in to fetch an exam
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

    // Parse examId from query string
    const url    = new URL(req.url)
    const examId = url.searchParams.get('examId')
    if (!examId) {
      return new Response(JSON.stringify({ error: 'examId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch exam — NOTE: correct_answer is intentionally excluded
    const { data: exam, error: examErr } = await supabase
      .from('exams')
      .select(`
        id,
        level,
        year,
        month,
        status,
        sections (
          id,
          type,
          time_limit,
          instructions,
          order_index,
          question_groups (
            id,
            group_key,
            group_type,
            instructions,
            passage_text,
            image_type,
            image_data,
            image_alt,
            audio_url,
            order_index,
            questions (
              id,
              question_number,
              question_text,
              underline_word,
              options,
              explanation,
              order_index,
              image_type,
              image_data,
              image_alt,
              image_position,
              passage_id
            ),
            group_passages (
              id,
              label,
              passage_text,
              order_index
            )
          )
        )
      `)
      .eq('id', examId)
      .eq('status', 'published')
      .single()

    if (examErr || !exam) {
      return new Response(JSON.stringify({ error: 'Exam not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Sort sections, groups, and questions by order_index
    const examTyped = exam as unknown as ExamRow
    const sorted = {
      ...examTyped,
      sections: [...examTyped.sections]
        .sort((a, b) => a.order_index - b.order_index)
        .map((section) => ({
          ...section,
          question_groups: [...section.question_groups]
            .sort((a, b) => a.order_index - b.order_index)
            .map((group) => {
              const passageMap = new Map(
                (group.group_passages ?? []).map((p) => [p.id, p])
              )
              return {
                ...group,
                questions: [...group.questions]
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((q) => {
                    const passage = q.passage_id ? passageMap.get(q.passage_id) : undefined
                    return {
                      ...q,
                      passage_text:  passage?.passage_text ?? null,
                      passage_label: passage?.label ?? null,
                    }
                  }),
              }
            }),
        })),
    }

    return new Response(JSON.stringify({ exam: sorted }), {
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

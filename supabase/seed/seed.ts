import { createClient } from '@supabase/supabase-js'
import { ExamSchema } from '@jlpt/shared'
import * as fs from 'fs'
import * as path from 'path'

// ================================
// Seed Script — imports exam JSON into Supabase
// Usage: npm run db:seed -- --file=n5_2017_december.json
// ================================

const SUPABASE_URL          = process.env.SUPABASE_URL          ?? ''
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function seedExam(filePath: string) {
  console.log(`\n📄 Reading: ${filePath}`)

  const raw  = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(raw)

  // Validate against schema
  const result = ExamSchema.safeParse(json)
  if (!result.success) {
    console.error('❌ Invalid exam JSON:')
    console.error(result.error.format())
    process.exit(1)
  }

  const exam = result.data
  console.log(`✅ Validated: ${exam.meta.level} ${exam.meta.year} ${exam.meta.month}`)

  // ── 1. Insert exam ──────────────────────────────────────
  const { data: examRow, error: examErr } = await supabase
    .from('exams')
    .upsert({
      level:       exam.meta.level,
      year:        exam.meta.year,
      month:       exam.meta.month,
      status:      exam.meta.status,
      source_json: json,
    }, { onConflict: 'level,year,month' })
    .select()
    .single()

  if (examErr) {
    console.error('❌ Failed to insert exam:', examErr.message)
    process.exit(1)
  }
  console.log(`  ✓ Exam inserted: ${examRow.id}`)

  // ── 2. Insert sections ──────────────────────────────────
  for (const section of exam.sections) {
    const { data: sectionRow, error: secErr } = await supabase
      .from('sections')
      .insert({
        exam_id:     examRow.id,
        type:        section.type,
        time_limit:  section.time_limit,
        instructions: section.instructions ?? null,
        order_index: section.order_index,
      })
      .select()
      .single()

    if (secErr) {
      console.error(`❌ Failed to insert section ${section.type}:`, secErr.message)
      process.exit(1)
    }
    console.log(`  ✓ Section: ${section.type}`)

    // ── 3. Insert question groups ────────────────────────
    for (const group of section.question_groups) {
      const { data: groupRow, error: groupErr } = await supabase
        .from('question_groups')
        .insert({
          section_id:   sectionRow.id,
          group_key:    group.id,
          group_type:   group.type,
          instructions: group.instructions ?? null,
          passage_text: group.passage_text ?? null,
          image_type:   group.image?.source ?? 'none',
          image_data:   group.image?.svg_data ?? group.image?.storage_url ?? null,
          image_alt:    group.image?.alt_text ?? null,
          audio_url:    group.audio_url ?? null,
          order_index:  group.order_index,
        })
        .select()
        .single()

      if (groupErr) {
        console.error(`❌ Failed to insert group ${group.id}:`, groupErr.message)
        process.exit(1)
      }

      // ── 4. Insert questions ───────────────────────────────
      if (group.type === 'multi_passage' && group.passages) {
        // multi_passage: insert each passage row, then link its questions
        let totalQ = 0
        for (const [pIdx, passage] of group.passages.entries()) {
          const { data: passageRow, error: passErr } = await supabase
            .from('group_passages')
            .insert({
              group_id:     groupRow.id,
              label:        passage.label ?? null,
              passage_text: passage.text,
              order_index:  pIdx,
            })
            .select()
            .single()

          if (passErr) {
            console.error(`❌ Failed to insert passage ${pIdx} for group ${group.id}:`, passErr.message)
            process.exit(1)
          }

          const questionRows = passage.questions.map((question, idx) => ({
            group_id:        groupRow.id,
            passage_id:      passageRow.id,
            question_number: question.number,
            question_text:   question.text,
            underline_word:  question.underline_word ?? null,
            options:         question.options,
            correct_answer:  question.correct_answer,
            explanation:     question.explanation ?? null,
            order_index:     idx,
            image_type:      question.image?.source ?? null,
            image_data:      question.image?.svg_data ?? question.image?.storage_url ?? null,
            image_alt:       question.image?.alt_text ?? null,
            image_position:  question.image_position ?? null,
          }))

          const { error: qErr } = await supabase.from('questions').insert(questionRows)
          if (qErr) {
            console.error(`❌ Failed to insert questions for passage ${pIdx} in group ${group.id}:`, qErr.message)
            process.exit(1)
          }
          totalQ += questionRows.length
        }
        console.log(`    ✓ Group ${group.id}: ${group.passages.length} passages, ${totalQ} questions`)
      } else {
        // standard groups: flat question list
        const questionRows = group.questions.map((question, idx) => ({
          group_id:        groupRow.id,
          question_number: question.number,
          question_text:   question.text,
          underline_word:  question.underline_word ?? null,
          options:         question.options,
          correct_answer:  question.correct_answer,
          explanation:     question.explanation ?? null,
          order_index:     idx,
          image_type:      question.image?.source ?? null,
          image_data:      question.image?.svg_data ?? question.image?.storage_url ?? null,
          image_alt:       question.image?.alt_text ?? null,
          image_position:  question.image_position ?? null,
        }))

        const { error: qErr } = await supabase.from('questions').insert(questionRows)
        if (qErr) {
          console.error(`❌ Failed to insert questions for group ${group.id}:`, qErr.message)
          process.exit(1)
        }
        console.log(`    ✓ Group ${group.id}: ${group.questions.length} questions`)
      }
    }
  }

  console.log(`\n🎉 Seeded successfully: ${exam.meta.level} ${exam.meta.year} ${exam.meta.month}`)
  console.log(`   Exam ID: ${examRow.id}`)
}

// ── CLI entry ────────────────────────────────────────────
const args    = process.argv.slice(2)
const fileArg = args.find(a => a.startsWith('--file='))
const fileName = fileArg?.split('=')[1] ?? 'n5_2017_december.json'
const filePath = path.join(__dirname, fileName)

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`)
  process.exit(1)
}

seedExam(filePath).catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

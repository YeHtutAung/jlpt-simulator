import { useState } from 'react'
import type { ExamSchemaType } from '@jlpt/shared'
import { supabaseAdmin } from '../lib/supabase'
import JsonUploader   from '../components/JsonUploader'
import QuestionPreview from '../components/QuestionPreview'
import AudioUploader  from '../components/AudioUploader'

type UploadStep = 'upload' | 'preview' | 'audio' | 'importing' | 'done'

export default function UploadExam() {
  const [step, setStep]       = useState<UploadStep>('upload')
  const [exam, setExam]       = useState<ExamSchemaType | null>(null)
  const [rawJson, setRawJson] = useState<object | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [examId, setExamId]   = useState<string | null>(null)

  function handleValidated(parsedExam: ExamSchemaType, raw: object) {
    setExam(parsedExam)
    setRawJson(raw)
    setStep('preview')
  }

  async function handleImport() {
    if (!exam || !rawJson) return
    setStep('importing')
    setError(null)

    try {
      // 1. Upsert exam
      const { data: examRow, error: examErr } = await supabaseAdmin
        .from('exams')
        .upsert({
          level:       exam.meta.level,
          year:        exam.meta.year,
          month:       exam.meta.month,
          status:      exam.meta.status,
          source_json: rawJson,
        }, { onConflict: 'level,year,month' })
        .select()
        .single()

      if (examErr || !examRow) throw new Error(examErr?.message ?? 'Failed to insert exam')

      // 2. Sections
      for (const section of exam.sections) {
        const { data: sectionRow, error: secErr } = await supabaseAdmin
          .from('sections')
          .insert({
            exam_id:      examRow.id,
            type:         section.type,
            time_limit:   section.time_limit,
            instructions: section.instructions ?? null,
            order_index:  section.order_index,
          })
          .select()
          .single()

        if (secErr || !sectionRow) throw new Error(secErr?.message ?? 'Failed to insert section')

        // 3. Groups
        for (const group of section.question_groups) {
          const { data: groupRow, error: groupErr } = await supabaseAdmin
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

          if (groupErr || !groupRow) throw new Error(groupErr?.message ?? 'Failed to insert group')

          // 4. Questions
          const questionRows = group.questions.map((q, idx) => ({
            group_id:        groupRow.id,
            question_number: q.number,
            question_text:   q.text,
            underline_word:  q.underline_word ?? null,
            options:         q.options,
            correct_answer:  q.correct_answer,
            explanation:     q.explanation ?? null,
            order_index:     idx,
          }))

          const { error: qErr } = await supabaseAdmin
            .from('questions')
            .insert(questionRows)

          if (qErr) throw new Error(qErr.message ?? 'Failed to insert questions')
        }
      }

      setExamId(examRow.id)
      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed')
      setStep('preview')
    }
  }

  async function handlePublish() {
    if (!examId) return
    await supabaseAdmin.from('exams').update({ status: 'published' }).eq('id', examId)
    window.location.href = '/exams'
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-2">Upload Exam</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        Upload a validated exam JSON file to insert it into the database.
      </p>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div>
          <h2 className="text-base font-medium mb-3">Step 1: Select JSON file</h2>
          <JsonUploader onValidated={handleValidated} />
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && exam && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Step 2: Review before importing</h2>
            <button
              onClick={() => { setExam(null); setStep('upload') }}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              ← Back
            </button>
          </div>

          <QuestionPreview exam={exam} />

          {error && (
            <p className="text-sm text-[var(--color-error)] bg-red-50 p-3 rounded">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              className="px-5 py-2 bg-[var(--color-primary)] text-white text-sm font-medium rounded hover:bg-[var(--color-primary-hover)]"
            >
              Import to Database
            </button>
            <button
              onClick={() => setStep('audio')}
              className="px-5 py-2 border border-[var(--color-border)] text-sm font-medium rounded hover:bg-gray-50"
            >
              Upload Audio First
            </button>
          </div>
        </div>
      )}

      {/* Step: Audio */}
      {step === 'audio' && exam && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Upload Audio Files (optional)</h2>
            <button onClick={() => setStep('preview')} className="text-sm text-[var(--color-text-muted)]">
              ← Back
            </button>
          </div>
          <AudioUploader
            level={exam.meta.level}
            year={exam.meta.year}
            month={exam.meta.month}
            onComplete={() => setStep('preview')}
          />
        </div>
      )}

      {/* Step: Importing */}
      {step === 'importing' && (
        <div className="text-center py-16">
          <div className="text-lg text-[var(--color-text-muted)]">Importing exam data...</div>
          <div className="text-sm text-[var(--color-text-muted)] mt-2">Please wait</div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div className="text-center py-16 space-y-4">
          <div className="text-4xl">🎉</div>
          <h2 className="text-xl font-semibold text-[var(--color-text)]">Import successful!</h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            Exam ID: <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{examId}</code>
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handlePublish}
              className="px-5 py-2 bg-[var(--color-success)] text-white text-sm font-medium rounded hover:bg-green-700"
            >
              Publish Now
            </button>
            <button
              onClick={() => { setStep('upload'); setExam(null); setExamId(null) }}
              className="px-5 py-2 border border-[var(--color-border)] text-sm font-medium rounded hover:bg-gray-50"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

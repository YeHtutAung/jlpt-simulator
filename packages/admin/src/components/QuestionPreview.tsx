import type { ExamSchemaType } from '@jlpt/shared'

interface QuestionPreviewProps {
  exam: ExamSchemaType
}

export default function QuestionPreview({ exam }: QuestionPreviewProps) {
  const totalQuestions = exam.sections.reduce(
    (total, section) =>
      total + section.question_groups.reduce(
        (sTotal, group) => sTotal + group.questions.length,
        0
      ),
    0
  )

  return (
    <div className="space-y-6">
      {/* Meta */}
      <div className="bg-[var(--color-bg)] rounded-lg p-4 text-sm">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-[var(--color-text-muted)] text-xs mb-0.5">Level</div>
            <div className="font-semibold">{exam.meta.level}</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)] text-xs mb-0.5">Year</div>
            <div className="font-semibold">{exam.meta.year}</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)] text-xs mb-0.5">Month</div>
            <div className="font-semibold capitalize">{exam.meta.month}</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)] text-xs mb-0.5">Questions</div>
            <div className="font-semibold">{totalQuestions}</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      {exam.sections.map((section) => {
        const sectionTotal = section.question_groups.reduce(
          (sum, g) => sum + g.questions.length, 0
        )
        return (
          <div key={section.type} className="border border-[var(--color-border)] rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="font-medium text-sm capitalize">
                {section.type.replace('_', ' ')}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {section.question_groups.length} groups · {sectionTotal} questions · {section.time_limit}min
              </span>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {section.question_groups.map((group) => (
                <div key={group.id} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[var(--color-text-muted)]">{group.id}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{group.type}</span>
                      {group.audio_url && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">audio</span>
                      )}
                      {group.image && group.image.source !== 'none' && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">
                          {group.image.source}
                        </span>
                      )}
                    </div>
                  </div>

                  {group.instructions && (
                    <p className="text-xs text-[var(--color-text-muted)] mb-2">{group.instructions}</p>
                  )}

                  {/* First 2 questions as preview */}
                  <div className="space-y-2">
                    {group.questions.slice(0, 2).map((q) => (
                      <div key={q.number} className="text-xs bg-[var(--color-bg)] rounded p-2">
                        <span className="font-medium mr-1">Q{q.number}</span>
                        <span className="text-[var(--color-text-muted)]">{q.text.slice(0, 60)}{q.text.length > 60 ? '…' : ''}</span>
                      </div>
                    ))}
                    {group.questions.length > 2 && (
                      <p className="text-xs text-[var(--color-text-muted)] pl-2">
                        +{group.questions.length - 2} more question{group.questions.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

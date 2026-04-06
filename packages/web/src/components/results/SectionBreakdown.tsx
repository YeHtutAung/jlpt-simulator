import type { SectionScore } from '@jlpt/shared'

const SECTION_LABELS: Record<string, { en: string; ja: string }> = {
  vocabulary:       { en: 'Vocabulary',         ja: '文字・語彙' },
  grammar_reading:  { en: 'Grammar & Reading',  ja: '文法・読解' },
  listening:        { en: 'Listening',           ja: '聴解' },
}

interface SectionBreakdownProps {
  sections: SectionScore[]
}

export function SectionBreakdown({ sections }: SectionBreakdownProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-text">
        Section Breakdown
      </h3>

      {sections.map((section, i) => {
        const label = SECTION_LABELS[section.section_type]
        const color =
          section.percentage >= 80 ? 'bg-success' :
          section.percentage >= 60 ? 'bg-accent'  :
          'bg-error'

        const mins = Math.floor(section.time_spent / 60)
        const secs = section.time_spent % 60

        return (
          <div key={i} className="space-y-1.5 animate-fade-in"
            style={{ animationDelay: `${i * 150}ms` }}>

            <div className="flex justify-between items-baseline">
              <div>
                <span className="font-sans font-medium text-text text-sm">
                  {label?.en}
                </span>
                <span className="text-text-muted text-xs ml-2 font-japanese">
                  {label?.ja}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-text text-sm">
                  {section.correct}/{section.total}
                </span>
                <span className="text-text-muted text-xs ml-2">
                  {section.percentage}%
                </span>
              </div>
            </div>

            {/* Bar */}
            <div className="h-3 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${color}`}
                style={{
                  width: `${section.percentage}%`,
                  transitionDelay: `${i * 150 + 200}ms`,
                }}
              />
            </div>

            <p className="text-xs text-text-muted font-sans">
              Time spent: {mins}m {secs}s
            </p>
          </div>
        )
      })}
    </div>
  )
}

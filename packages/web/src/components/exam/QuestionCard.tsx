import { memo } from 'react'
import type { ExamQuestion, ExamQuestionGroup, ExamImage } from '@jlpt/shared'
import { OptionButton } from './OptionButton'
import { AudioPlayer } from './AudioPlayer'
import { ImageRenderer } from './ImageRenderer'
import { PassageReader } from './PassageReader'

type ReviewMode = {
  enabled: true
  selectedAnswer: number | null
  correctAnswer: number
}

interface QuestionCardProps {
  group: ExamQuestionGroup
  question: ExamQuestion
  selectedOption: number | null
  onSelect: (option: number) => void
  isFlagged: boolean
  onToggleFlag: () => void
  examMode: 'full_exam' | 'practice'
  review?: ReviewMode
}

// Renders question.image only when position matches the target slot
function QuestionImage({
  image,
  position,
  target,
}: {
  image: ExamImage | undefined
  position: 'above' | 'below' | 'side_by_side'
  target: 'above' | 'below' | 'side_by_side'
}) {
  if (!image || image.source === 'none') return null
  if (position !== target) return null
  return <ImageRenderer image={image} className="my-2" />
}

export const QuestionCard = memo(function QuestionCard({
  group,
  question,
  selectedOption,
  onSelect,
  isFlagged,
  onToggleFlag,
  examMode,
  review,
}: QuestionCardProps) {
  const isReview = review?.enabled ?? false
  const imgPos   = question.image_position ?? 'above'

  function getOptionState(optionNumber: number) {
    if (!isReview) {
      return selectedOption === optionNumber ? 'selected' : 'default'
    }
    if (optionNumber === review?.correctAnswer) return 'correct'
    if (optionNumber === review?.selectedAnswer && optionNumber !== review?.correctAnswer) {
      return 'incorrect'
    }
    return 'default'
  }

  // ── Question header (number + text + flag button) ──────
  const questionHeader = (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 flex-1">
        <span className="shrink-0 w-8 h-8 rounded-full bg-accent text-white
                         flex items-center justify-center text-sm font-semibold">
          {question.number}
        </span>
        <p className="question-text flex-1">
          {question.underline_word ? (
            <>
              {question.text.split(question.underline_word).map((part, i, arr) => (
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span className="underline decoration-2 decoration-primary font-semibold">
                      {question.underline_word}
                    </span>
                  </span>
                ) : <span key={i}>{part}</span>
              ))}
            </>
          ) : question.text}
        </p>
      </div>

      {!isReview && (
        <button
          onClick={onToggleFlag}
          className={[
            'shrink-0 p-1.5 rounded-lg transition-colors',
            isFlagged
              ? 'text-warning bg-yellow-50 dark:bg-yellow-900/30'
              : 'text-text-muted hover:text-warning hover:bg-yellow-50 dark:hover:bg-yellow-900/30',
          ].join(' ')}
          aria-label={isFlagged ? 'Remove flag' : 'Flag for review'}
          title={isFlagged ? 'Remove flag' : 'Flag for review'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={isFlagged ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
            <line x1="4" y1="22" x2="4" y2="15" />
          </svg>
        </button>
      )}
    </div>
  )

  // ── Options ────────────────────────────────────────────
  const optionsList = (
    <div className="space-y-2.5">
      {question.options.map(option => (
        <OptionButton
          key={option.number}
          number={option.number as 1 | 2 | 3 | 4}
          text={option.text}
          image_type={option.image_type}
          image_data={option.image_data}
          state={getOptionState(option.number)}
          disabled={isReview}
          onClick={() => !isReview && onSelect(option.number)}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Group-level instructions */}
      {group.instructions && (
        <p className="text-sm text-text-muted font-sans bg-bg px-4 py-2 rounded-lg
                       border border-border">
          {group.instructions}
        </p>
      )}

      {/* Group-level passage (text_with_passage) */}
      {group.passage_text && (
        <PassageReader passage={group.passage_text} />
      )}

      {/* Per-question passage (multi_passage) */}
      {question.passage_text && (
        <PassageReader
          passage={question.passage_text}
          label={question.passage_label ?? undefined}
        />
      )}

      {/* Group-level audio */}
      {group.audio_url && (
        <AudioPlayer
          audioUrl={group.audio_url}
          restrictReplay={examMode === 'full_exam'}
        />
      )}

      {/* Group-level image */}
      {group.image && group.image.source !== 'none' && (
        <ImageRenderer image={group.image} className="my-2" />
      )}

      {/* Question image — above slot */}
      <QuestionImage image={question.image} position={imgPos} target="above" />

      {/* Side-by-side layout: question text beside image on md+, stacks on mobile */}
      {imgPos === 'side_by_side' ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <div className="flex-1">{questionHeader}</div>
            {question.image && question.image.source !== 'none' && (
              <div className="w-full md:w-64 shrink-0">
                <ImageRenderer image={question.image} className="w-full" />
              </div>
            )}
          </div>
          {optionsList}
        </>
      ) : (
        <>
          {questionHeader}
          {/* Question image — below slot */}
          <QuestionImage image={question.image} position={imgPos} target="below" />
          {optionsList}
        </>
      )}

      {/* Explanation (review mode only) */}
      {isReview && question.explanation && (
        <div className="bg-blue-50 dark:bg-accent/15 border border-blue-200 dark:border-accent/30 rounded-xl p-4">
          <p className="text-sm font-semibold text-accent mb-1">Explanation</p>
          <p className="text-sm text-text leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  )
})

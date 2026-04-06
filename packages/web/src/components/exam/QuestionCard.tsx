import { memo } from 'react'
import type { ExamQuestion, ExamQuestionGroup } from '@jlpt/shared'
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

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Instructions (if group has them) */}
      {group.instructions && (
        <p className="text-sm text-text-muted font-sans bg-bg px-4 py-2 rounded-lg
                       border border-border">
          {group.instructions}
        </p>
      )}

      {/* Passage (reading comprehension) */}
      {group.passage_text && (
        <PassageReader
          passage={group.passage_text}
          instructions={group.instructions}
        />
      )}

      {/* Audio player (listening) */}
      {group.audio_url && (
        <AudioPlayer
          audioUrl={group.audio_url}
          restrictReplay={examMode === 'full_exam'}
        />
      )}

      {/* Image (SVG or storage) */}
      {group.image && group.image.source !== 'none' && (
        <ImageRenderer image={group.image} className="my-2" />
      )}

      {/* Question header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Question number */}
          <span className="shrink-0 w-8 h-8 rounded-full bg-accent text-white
                           flex items-center justify-center text-sm font-semibold">
            {question.number}
          </span>

          {/* Question text */}
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

        {/* Flag button */}
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

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map(option => (
          <OptionButton
            key={option.number}
            number={option.number as 1 | 2 | 3 | 4}
            text={option.text}
            state={getOptionState(option.number)}
            disabled={isReview}
            onClick={() => !isReview && onSelect(option.number)}
          />
        ))}
      </div>

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

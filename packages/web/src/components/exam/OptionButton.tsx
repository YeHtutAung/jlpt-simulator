import { memo } from 'react'
import DOMPurify from 'dompurify'

type OptionState = 'default' | 'selected' | 'correct' | 'incorrect'

interface OptionButtonProps {
  number: 1 | 2 | 3 | 4
  text: string
  state: OptionState
  disabled?: boolean
  onClick: () => void
  image_type?: string
  image_data?: string
}

const stateClasses: Record<OptionState, string> = {
  default:   'option-btn-default',
  selected:  'option-btn-selected',
  correct:   'option-btn-correct',
  incorrect: 'option-btn-incorrect',
}

const numberLabels = ['①', '②', '③', '④'] as const

export const OptionButton = memo(function OptionButton({
  number,
  text,
  state,
  disabled = false,
  onClick,
  image_type,
  image_data,
}: OptionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        stateClasses[state],
        'flex items-start gap-3',
        disabled && state === 'default' ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {/* Number badge */}
      <span className={[
        'shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
        'text-sm font-semibold border-2 transition-colors',
        state === 'default'   ? 'border-border text-text-muted' : '',
        state === 'selected'  ? 'border-accent text-accent bg-blue-100 dark:bg-accent/20' : '',
        state === 'correct'   ? 'border-success text-success bg-green-100 dark:bg-success/20' : '',
        state === 'incorrect' ? 'border-error text-error bg-red-100 dark:bg-error/20' : '',
      ].join(' ')}>
        {numberLabels[number - 1]}
      </span>

      {/* Option content: image or text */}
      {image_type === 'svg' && image_data ? (
        <span
          className="block w-24 h-24"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(image_data) }}
        />
      ) : image_type === 'storage' && image_data ? (
        <img src={image_data} alt={`Option ${number}`} className="w-24 h-24 object-contain" />
      ) : (
        <span className="text-ja leading-relaxed">{text}</span>
      )}
    </button>
  )
})

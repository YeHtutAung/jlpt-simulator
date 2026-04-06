import type { ExamImage } from '@jlpt/shared'
import { SvgRenderer } from './SvgRenderer'

interface ImageRendererProps {
  image: ExamImage
  className?: string
}

export function ImageRenderer({ image, className = '' }: ImageRendererProps) {
  if (image.source === 'none') return null

  if (image.source === 'svg' && image.svg_data) {
    return (
      <SvgRenderer
        svgData={image.svg_data}
        altText={image.alt_text}
        className={className}
      />
    )
  }

  if (image.source === 'storage' && image.storage_url) {
    return (
      <div className={['flex justify-center', className].join(' ')}>
        <img
          src={image.storage_url}
          alt={image.alt_text ?? 'Question image'}
          className="max-w-full max-h-64 object-contain rounded-lg border border-border"
          loading="lazy"
        />
      </div>
    )
  }

  return null
}

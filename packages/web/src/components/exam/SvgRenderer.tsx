import DOMPurify from 'dompurify'

interface SvgRendererProps {
  svgData: string
  altText?: string
  className?: string
}

export function SvgRenderer({ svgData, altText, className = '' }: SvgRendererProps) {
  // Sanitize SVG before rendering to prevent XSS
  const cleanSvg = DOMPurify.sanitize(svgData, {
    USE_PROFILES: { svg: true, svgFilters: true },
  })

  return (
    <div
      className={['flex justify-center items-center', className].join(' ')}
      role="img"
      aria-label={altText ?? 'Question image'}
      dangerouslySetInnerHTML={{ __html: cleanSvg }}
    />
  )
}

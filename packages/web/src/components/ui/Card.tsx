import { type HTMLAttributes } from 'react'

// ================================
// Card — reusable surface container
// Used in: exam browser, dashboard, results
// ================================

type Variant   = 'default' | 'elevated' | 'bordered' | 'flat'
type PadSize   = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?:   Variant
  padding?:   PadSize
  clickable?: boolean
  header?:    React.ReactNode
  footer?:    React.ReactNode
}

const variantClasses: Record<Variant, string> = {
  default:  'bg-surface border border-border rounded-2xl',
  elevated: 'bg-surface rounded-2xl shadow-md',
  bordered: 'bg-surface border-2 border-border rounded-2xl',
  flat:     'bg-bg rounded-2xl',
}

const paddingClasses: Record<PadSize, string> = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export function Card({
  variant   = 'default',
  padding   = 'md',
  clickable = false,
  header,
  footer,
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={[
        variantClasses[variant],
        clickable
          ? 'cursor-pointer transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0'
          : '',
        className,
      ].join(' ')}
      {...props}
    >
      {header && (
        <div className={[
          'border-b border-border',
          padding !== 'none' ? `${paddingClasses[padding]} pb-4` : 'px-6 py-4',
        ].join(' ')}>
          {header}
        </div>
      )}

      <div className={header || footer ? paddingClasses[padding] : paddingClasses[padding]}>
        {children}
      </div>

      {footer && (
        <div className={[
          'border-t border-border',
          padding !== 'none' ? `${paddingClasses[padding]} pt-4` : 'px-6 py-4',
        ].join(' ')}>
          {footer}
        </div>
      )}
    </div>
  )
}

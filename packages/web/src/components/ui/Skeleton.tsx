// ================================
// Skeleton components
// Animated placeholder shapes for loading states.
//
// Base:              <Skeleton className="h-4 w-32" />
// Exam card grid:    <ExamCardSkeleton />  (use 6 in a grid)
// Dashboard stats:   <DashboardSkeleton />
// ================================

import type { HTMLAttributes } from 'react'

// ── Base ─────────────────────────────────────────────────

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

export function Skeleton({ className = '', rounded = 'md', ...props }: SkeletonProps) {
  const roundedClass = {
    sm:   'rounded',
    md:   'rounded-lg',
    lg:   'rounded-xl',
    full: 'rounded-full',
  }[rounded]

  return (
    <div
      className={`animate-pulse bg-border ${roundedClass} ${className}`}
      {...props}
    />
  )
}

// ── ExamCardSkeleton ──────────────────────────────────────
// Matches the exam card in Home.tsx:
//   bg-surface rounded-xl border p-5, ~h-32 with level badge + year + subtitle

export function ExamCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 h-36 space-y-3">
      {/* Top row: level badge + month */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-10" rounded="full" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* Year */}
      <Skeleton className="h-8 w-20" />
      {/* Subtitle */}
      <Skeleton className="h-3.5 w-16" />
      {/* CTA */}
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

// ── DashboardSkeleton ─────────────────────────────────────
// Matches the Dashboard layout:
//   3 stat cards + a list of 5 attempt rows

export function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-9 w-28" rounded="lg" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border p-5
                                   text-center space-y-2">
            <Skeleton className="h-9 w-16 mx-auto" />
            <Skeleton className="h-3.5 w-20 mx-auto" />
          </div>
        ))}
      </div>

      {/* Attempt rows */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-36 mb-4" />
        {[...Array(5)].map((_, i) => (
          <AttemptRowSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

// ── AttemptRowSkeleton ────────────────────────────────────
// Matches the attempt row in Dashboard.tsx:
//   border rounded-xl p-4, flex between, level badge + text + score + buttons

function AttemptRowSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border p-4
                     flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-10" rounded="full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-14" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-16" rounded="lg" />
          <Skeleton className="h-7 w-16" rounded="lg" />
        </div>
      </div>
    </div>
  )
}

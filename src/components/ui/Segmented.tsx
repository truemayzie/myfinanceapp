import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Переключатель режимов: расход / доход / в цель */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  className?: string
}) {
  return (
    <div className={cn('flex gap-1 rounded-xl bg-surface-2 p-1', className)}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-lg py-2.5 text-xs font-bold transition',
            value === o.value ? 'bg-card text-ink shadow-card' : 'text-muted hover:text-ink',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Выбор категории, цели или суммы-пресета */
export function Chip({
  active,
  onClick,
  className,
  children,
}: {
  active?: boolean
  onClick?: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition',
        active
          ? 'border-brand bg-brand-soft text-brand'
          : 'border-line bg-card text-ink-soft hover:border-[#c9c6bd] hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}

export function ChipRow({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('flex flex-wrap gap-2', className)}>{children}</div>
}

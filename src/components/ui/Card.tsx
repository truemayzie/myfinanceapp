import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Icon } from '../icons'
import { iconOf, tint } from '../../data/seed'
import type { Category } from '../../types'

/** Белая карточка — базовая поверхность дизайна */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-card shadow-card', className)}>
      {children}
    </div>
  )
}

/**
 * Значок категории: пастельная плашка + насыщенная иконка.
 * Пастель считается из единственного цвета, который есть у категории в БД.
 */
export function Sign({
  cat,
  size = 36,
  iconSize = 16,
  className,
}: {
  cat: Pick<Category, 'icon' | 'color'>
  size?: number
  iconSize?: number
  className?: string
}) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-xl', className)}
      style={{ width: size, height: size, background: tint(cat.color), color: cat.color }}
    >
      <Icon name={iconOf(cat)} size={iconSize} />
    </span>
  )
}

/** Плашка произвольного цвета — для доходов, целей и прочих не-категорий */
export function SignRaw({
  color,
  size = 36,
  className,
  children,
}: {
  color: string
  size?: number
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-xl', className)}
      style={{ width: size, height: size, background: tint(color), color }}
    >
      {children}
    </span>
  )
}

const BADGE_TONES: Record<string, string> = {
  ok: 'bg-brand-soft text-brand',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-surface-2 text-muted',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: 'ok' | 'warn' | 'danger' | 'neutral'
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Метрика: подпись, крупное значение, пояснение под ним */
export function StatTile({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
  className,
}: {
  label: string
  value: string
  hint?: string
  icon?: ReactNode
  tone?: 'brand' | 'danger' | 'neutral'
  className?: string
}) {
  return (
    <div className={cn('rounded-tile border border-line bg-card p-4 shadow-card sm:p-5', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-semibold text-faint">{label}</p>
        {icon && (
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-lg',
              tone === 'brand' ? 'bg-brand-soft text-brand' : tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-surface-2 text-muted',
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={cn(
          'num mt-4 text-[19px] font-bold tracking-[-0.04em] sm:text-[21px]',
          tone === 'danger' && 'text-danger',
        )}
      >
        {value}
      </p>
      {hint && (
        <p className={cn('mt-1.5 text-[11px] font-semibold', tone === 'danger' ? 'text-danger' : 'text-dim')}>{hint}</p>
      )}
    </div>
  )
}

/** Строка списка внутри Card — с разделителями между соседями */
export function Row({
  as = 'div',
  className,
  onClick,
  children,
}: {
  as?: 'div' | 'button'
  className?: string
  onClick?: () => void
  children: ReactNode
}) {
  const Cmp = as
  return (
    <Cmp
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 border-b border-line-soft px-4 py-3.5 text-left last:border-b-0',
        as === 'button' && 'transition hover:bg-surface-3',
        className,
      )}
    >
      {children}
    </Cmp>
  )
}

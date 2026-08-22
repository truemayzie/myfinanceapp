import type { ReactNode } from 'react'

/** Шапка экрана: подпись капсом, крупный заголовок, описание, действие справа */
export function AppHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string
  subtitle?: ReactNode
  eyebrow?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.055em] sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-faint">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/** Разделитель секции внутри экрана */
export function Section({
  title,
  eyebrow,
  action,
  actionLabel,
  onAction,
}: {
  title: string
  eyebrow?: string
  action?: ReactNode
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="mb-4 mt-8 flex items-end justify-between gap-3 first:mt-0">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-1 text-lg font-bold tracking-[-0.035em]">{title}</h2>
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="shrink-0 text-xs font-bold text-brand hover:underline">
          {actionLabel}
        </button>
      )}
      {action}
    </div>
  )
}

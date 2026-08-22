import type { ReactNode } from 'react'
import { Icon, type IconName } from '../icons'

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: IconName
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-[#d6d3c9] bg-surface-3 px-6 py-11 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-card text-dim shadow-tile">
        <Icon name={icon} size={24} />
      </div>
      <h3 className="mt-4 text-sm font-bold">{title}</h3>
      {text && <p className="mt-1.5 max-w-[280px] text-xs leading-5 text-dim">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

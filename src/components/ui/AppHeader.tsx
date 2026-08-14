import { ReactNode } from 'react'

export function AppHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="app-header">
      <div className="head-main">
        <h1 className="head-title">{title}</h1>
        {subtitle && <div className="head-sub">{subtitle}</div>}
      </div>
      {actions && <div className="head-actions">{actions}</div>}
    </div>
  )
}

export function Section({ title, action, actionLabel, onAction }: {
  title: string
  action?: ReactNode
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="section">
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
        {actionLabel && onAction && <button className="section-action" onClick={onAction}>{actionLabel}</button>}
        {action}
      </div>
    </div>
  )
}

import { ReactNode } from 'react'

export function EmptyState({ icon = '📭', text, action }: { icon?: string; text: string; action?: ReactNode }) {
  return (
    <div className="center">
      <div style={{ fontSize: 40 }}>{icon}</div>
      <p className="muted">{text}</p>
      {action}
    </div>
  )
}

import type { ReactNode } from 'react'
import { Icon, IconName } from '../icons'

export function EmptyState({ icon, title, text, action }: {
  icon: IconName
  title: string
  text?: string
  action?: ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty-art"><Icon name={icon} size={46} /></div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  )
}
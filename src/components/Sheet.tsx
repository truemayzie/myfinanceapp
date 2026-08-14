import { ReactNode } from 'react'

export function Sheet({ title, onClose, children, trailing }: {
  title: string
  onClose: () => void
  trailing?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-head">
          <h3 className="sheet-title">{title}</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {trailing}
            <button className="icon-btn" onClick={onClose} aria-label="Закрыть"><Close /></button>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

function Close() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg>
  )
}

export function Track({ pct, state = '' }: { pct: number; state?: string }) {
  return (
    <div className={`track ${state}`}>
      <i style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  )
}
import type { ReactNode } from 'react'

export function ProgressRing({ pct, size = 96, children }: { pct: number; size?: number; children: ReactNode }) {
  const r = (size - 8) / 2
  const c = 2 * Math.PI * r
  const filled = Math.min(100, Math.max(0, pct))
  return (
    <div className="ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={7} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (filled / 100) * c}
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  )
}
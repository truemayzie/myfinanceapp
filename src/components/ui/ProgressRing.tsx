import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function ProgressRing({ pct, size = 96, children }: { pct: number; size?: number; children: ReactNode }) {
  const stroke = 7
  const r = (size - stroke - 1) / 2
  const c = 2 * Math.PI * r
  const filled = Math.min(100, Math.max(0, pct))

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (filled / 100) * c }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-tight">{children}</div>
    </div>
  )
}

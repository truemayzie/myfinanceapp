import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/cn'

/** Нижняя шторка: на мобильном выезжает снизу, на широком экране — по центру */
export function Sheet({
  title,
  eyebrow = 'Действие',
  onClose,
  children,
  trailing,
}: {
  title: string
  eyebrow?: string
  onClose: () => void
  trailing?: ReactNode
  children: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/35 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="max-h-[92dvh] w-full max-w-[460px] overflow-y-auto rounded-t-hero bg-surface p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-hero sm:pb-6"
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow">{eyebrow}</p>
            <h2 className="mt-1 truncate text-xl font-bold tracking-[-0.04em]">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {trailing}
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="rounded-full p-2 text-dim transition hover:bg-surface-2 hover:text-ink"
            >
              <X className="size-5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

const TRACK_FILL: Record<string, string> = {
  '': 'bg-brand',
  ok: 'bg-brand',
  warn: 'bg-warn',
  over: 'bg-danger',
  none: 'bg-line',
}

export function Track({ pct, state = '', className }: { pct: number; state?: string; className?: string }) {
  const value = Math.min(100, Math.max(0, pct))
  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-surface-2', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={cn('h-full rounded-full', TRACK_FILL[state] ?? 'bg-brand')}
      />
    </div>
  )
}

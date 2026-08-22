import { motion } from 'framer-motion'

export interface BarItem { label: string; income: number; expense: number }

const H = 150

function fmt(v: number): string {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000) return `${Math.round(v / 1000)}k`
  return String(Math.round(v))
}

/** Пары столбиков доход/расход по месяцам */
export default function BarChart({ data }: { data: BarItem[] }) {
  const max = Math.max(1, ...data.flatMap(d => [d.income, d.expense]))

  return (
    <div>
      <div className="flex items-end gap-2 sm:gap-4" style={{ height: H }}>
        {data.map(d => (
          <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col justify-end">
            <div className="flex h-full items-end justify-center gap-1">
              <motion.i
                initial={{ height: 0 }}
                animate={{ height: Math.max(3, (d.income / max) * H) }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                title={`Доход: ${fmt(d.income)}`}
                className="w-full max-w-[14px] rounded-t-md bg-brand-mint"
              />
              <motion.i
                initial={{ height: 0 }}
                animate={{ height: Math.max(3, (d.expense / max) * H) }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.06 }}
                title={`Расход: ${fmt(d.expense)}`}
                className="w-full max-w-[14px] rounded-t-md bg-brand"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2 border-t border-line-soft pt-2.5 sm:gap-4">
        {data.map(d => (
          <span key={d.label} className="min-w-0 flex-1 truncate text-center text-[10px] font-bold text-dim">
            {d.label}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-5">
        <span className="flex items-center gap-2 text-[11px] font-semibold text-muted">
          <i className="size-2.5 rounded-sm bg-brand-mint" />
          Доход
        </span>
        <span className="flex items-center gap-2 text-[11px] font-semibold text-muted">
          <i className="size-2.5 rounded-sm bg-brand" />
          Расход
        </span>
        <span className="text-[11px] font-semibold text-pale">макс. {fmt(max)}</span>
      </div>
    </div>
  )
}

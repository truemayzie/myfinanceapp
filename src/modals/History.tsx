import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/ui/EmptyState'
import { Row } from '../components/ui/Card'
import { OpSign, opAmount, opSubtitle, opTitle } from '../components/OperationRow'
import type { Operation } from '../types'
import { cn } from '../lib/cn'

function dayLabel(date: string): string {
  const d = new Date(date + 'T00:00:00')
  const today = new Date()
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (same(d, today)) return 'Сегодня'
  const yest = new Date(today)
  yest.setDate(today.getDate() - 1)
  if (same(d, yest)) return 'Вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function History({ onClose }: { onClose: () => void }) {
  const operations = useStore(s => s.operations)
  const categories = useStore(s => s.categories)
  const goals = useStore(s => s.goals)
  const currency = useStore(s => s.user.currency)
  const deleteOperation = useStore(s => s.deleteOperation)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const groups = useMemo(() => {
    const sorted = operations.slice().sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt || 0) - (a.createdAt || 0))
    const map = new Map<string, Operation[]>()
    sorted.forEach(o => {
      const arr = map.get(o.date) ?? []
      arr.push(o)
      map.set(o.date, arr)
    })
    return [...map.entries()]
  }, [operations])

  if (operations.length === 0) {
    return (
      <Sheet title="История" eyebrow="Все операции" onClose={onClose}>
        <EmptyState icon="history" title="Пока пусто" text="Операции появятся здесь после первой записи." />
      </Sheet>
    )
  }

  return (
    <Sheet title="История" eyebrow={`${operations.length} операций`} onClose={onClose}>
      <div className="space-y-5">
        {groups.map(([date, ops]) => {
          const dayTotal = ops.reduce((s, o) => s + (o.type === 'expense' ? o.amount : 0), 0)
          return (
            <div key={date}>
              <div className="mb-2 flex items-center justify-between gap-3 px-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">{dayLabel(date)}</span>
                {dayTotal > 0 && (
                  <span className="num text-[11px] font-bold text-dim">
                    −{dayTotal.toLocaleString('ru-RU')} {currency}
                  </span>
                )}
              </div>

              <div className="overflow-hidden rounded-card border border-line bg-card">
                {ops.map(o => {
                  const cat = categories.find(c => c.id === o.categoryId)
                  const goal = goals.find(g => g.id === o.goalId)
                  return (
                    <Row key={o.id}>
                      <OpSign op={o} cat={cat} size={36} />
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[13px] font-bold">{opTitle(o, cat, goal)}</b>
                        <small className="mt-0.5 block truncate text-[11px] text-faint">{opSubtitle(o)}</small>
                      </span>
                      <b
                        className={cn(
                          'num shrink-0 text-[13px] font-bold',
                          o.type === 'expense' ? 'text-ink' : 'text-income',
                        )}
                      >
                        {opAmount(o, currency)}
                      </b>
                      <button
                        onClick={() => {
                          if (confirmId !== o.id) return setConfirmId(o.id)
                          deleteOperation(o.id)
                          setConfirmId(null)
                        }}
                        aria-label={confirmId === o.id ? 'Подтвердить удаление' : 'Удалить операцию'}
                        className={cn(
                          'shrink-0 rounded-lg p-1.5 transition',
                          confirmId === o.id
                            ? 'bg-danger-soft text-danger'
                            : 'text-pale hover:bg-surface-2 hover:text-danger',
                        )}
                      >
                        <Trash2 className="size-4" strokeWidth={1.9} />
                      </button>
                    </Row>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}

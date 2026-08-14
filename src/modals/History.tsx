import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { useApp } from '../AppContext'
import { Sheet } from '../components/Sheet'
import { EmptyState } from '../components/ui/EmptyState'
import { dateLabel, formatMoney } from '../utils/finance'
import type { Category, Goal, Operation } from '../types'

function opMeta(op: Operation, categories: Category[], goals: Goal[]) {
  if (op.type === 'income') return { emoji: '💰', name: op.comment || 'Доход' }
  if (op.type === 'goal_contribution') {
    const g = goals.find(x => x.id === op.goalId)
    return { emoji: g?.emoji || '🎯', name: `В цель: ${g?.title ?? '—'}` + (op.comment ? ` · ${op.comment}` : '') }
  }
  const c = categories.find(x => x.id === op.categoryId)
  return { emoji: c?.emoji ?? '📦', name: op.comment || c?.name || 'Без категории' }
}

export default function History({ onClose }: { onClose: () => void }) {
  const { categories, goals, operations, deleteOperation, user } = useStore()
  const { showToast } = useApp()

  const groups = useMemo(() => {
    const sorted = [...operations].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)
    const byDay = new Map<string, Operation[]>()
    for (const o of sorted) {
      const list = byDay.get(o.date) ?? []
      list.push(o)
      byDay.set(o.date, list)
    }
    return [...byDay.entries()]
  }, [operations])

  return (
    <Sheet title="История операций" onClose={onClose}>
      {groups.length === 0 && <EmptyState icon="🧾" text="Операций пока нет" />}
      <div className="sheet-body">
        {groups.map(([day, ops]) => (
          <div key={day} className="day-group">
            <div className="day-label">{dateLabel(day)}</div>
            {ops.map(o => {
              const meta = opMeta(o, categories, goals)
              return (
                <div className="op-row" key={o.id}>
                  <div className="cat-emoji" style={{ width: 36, height: 36, fontSize: 18 }}>{meta.emoji}</div>
                  <div className="cat-info">
                    <div className="cat-name" style={{ fontSize: 14 }}>{meta.name}</div>
                    {o.source === 'tbank_push' && <div className="cat-sub">из пуша Т-Банка</div>}
                  </div>
                  <div className={`op-amount ${o.type}`}>{o.type === 'income' ? '+' : '−'}{formatMoney(o.amount, user.currency)}</div>
                  <button className="icon-btn" onClick={() => { deleteOperation(o.id); showToast('Операция удалена') }} aria-label="Удалить">🗑️</button>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </Sheet>
  )
}

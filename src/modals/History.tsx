import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Icon } from '../components/icons'
import { iconOf } from '../data/seed'
import type { Operation } from '../types'

function dayLabel(date: string): string {
  const d = new Date(date + 'T00:00:00')
  const today = new Date()
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (same(d, today)) return 'Сегодня'
  const yest = new Date(today); yest.setDate(today.getDate() - 1)
  if (same(d, yest)) return 'Вчера'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function History({ onClose }: { onClose: () => void }) {
  const operations = useStore(s => s.operations)
  const categories = useStore(s => s.categories)
  const goals = useStore(s => s.goals)
  const deleteOperation = useStore(s => s.deleteOperation)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const groups = useMemo(() => {
    const sorted = operations.slice().sort((a, b) => b.date.localeCompare(a.date))
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
      <Sheet title="История" onClose={onClose}>
        <div className="empty">
          <div className="empty-art"><Icon name="history" size={46} /></div>
          <h3>Пока пусто</h3>
          <p>Операции появятся здесь после первого списания.</p>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet title="История" onClose={onClose}>
      <div className="hcart">
        {groups.map(([date, ops]) => {
          const dayTotal = ops.reduce((s, o) => s + (o.type === 'expense' ? o.amount : 0), 0)
          return (
            <div key={date} className="hday">
              <div className="hday-head">
                <span>{dayLabel(date)}</span>
                {dayTotal > 0 && <span className="num">{dayTotal.toLocaleString('ru-RU')} ₽</span>}
              </div>
              <div className="list">
                {ops.map(o => {
                  const cat = categories.find(c => c.id === o.categoryId)
                  const goal = goals.find(g => g.id === o.goalId)
                  return (
                    <div key={o.id} className="list-row">
                      <i className="sig" style={{ background: o.type === 'income' ? 'var(--income)' : o.type === 'expense' ? (cat?.color ?? 'var(--surface-2)') : 'var(--warn)' }}>
                        {o.type === 'income' ? <Icon name="arrowDown" size={16} />
                          : o.type === 'expense' ? <Icon name={iconOf(cat ?? {}) as any} size={16} />
                          : <Icon name="target" size={16} />}
                      </i>
                      <span className="row-main">
                        <b>
                          {o.type === 'income' ? 'Доход' : o.type === 'expense' ? (cat?.name ?? '—') : (goal?.title ?? 'В цель')}
                        </b>
                        <small>{o.comment || (o.source === 'tbank_push' ? 'из пуша банка' : 'вручную')} · {o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}</small>
                      </span>
                      <span className={`row-amount num ${o.type === 'expense' ? '' : 'pos'}`}>
                        {o.type === 'expense' ? '−' : '+'}{o.amount.toLocaleString('ru-RU')}
                      </span>
                      {confirmId === o.id ? (
                        <button className="icon-btn danger" onClick={() => { deleteOperation(o.id); setConfirmId(null) }} title="Подтвердить удаление"><Icon name="trash" size={17} /></button>
                      ) : (
                        <button className="icon-btn muted" onClick={() => setConfirmId(o.id)} title="Удалить"><Icon name="trash" size={17} /></button>
                      )}
                    </div>
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
import { useStore } from '../store/useStore'
import { useApp } from '../AppContext'
import { formatMoney, goalProgress } from '../utils/finance'
import type { Operation } from '../types'
import { ProgressRing } from '../components/ui/ProgressRing'
import { Track } from '../components/Sheet'
import { AppHeader, Section } from '../components/ui/AppHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/icons'

function monthlyRate(operations: Operation[]): number {
  const months = new Map<string, number>()
  operations.forEach(o => {
    if (o.type !== 'goal_contribution') return
    const k = o.date?.slice(0, 7) ?? ''
    months.set(k, (months.get(k) ?? 0) + o.amount)
  })
  if (months.size === 0) return 0
  const total = [...months.values()].reduce((s, v) => s + v, 0)
  return total / months.size
}

function etaLabel(remaining: number, rate: number): string {
  if (remaining <= 0) return 'цель достигнута'
  if (rate <= 0) return 'темп не задан — добавьте пополнение'
  const months = Math.ceil(remaining / rate)
  if (months <= 1) return 'около месяца'
  if (months < 12) return `${months} мес.`
  return `${(months / 12).toFixed(1)} лет`
}

export default function Goals() {
  const goals = useStore(s => s.goals)
  const operations = useStore(s => s.operations)
  const { openSheet } = useApp()

  const primary = goals.find(g => g.isPrimary) ?? goals[0] ?? null
  const others = goals.filter(g => g !== primary)
  const rate = monthlyRate(operations)

  if (goals.length === 0) {
    return (
      <div>
        <AppHeader title="Цели" subtitle="Копилки и планы" />
        <EmptyState
          icon="target"
          title="Ни одной цели"
          text="Создайте цель — копите на отпуск, технику или подушку безопасности."
          action={<Button onClick={() => openSheet('goal', {})}>Создать цель</Button>}
        />
      </div>
    )
  }

  return (
    <div>
      <AppHeader title="Цели" subtitle="Копилки и планы" />

      {primary && (
        <section className="goal-hero">
          <ProgressRing pct={goalProgress(primary)} size={104}>
            <span style={{ fontSize: 26 }}>{primary.emoji}</span>
            <small className="num">{Math.round(goalProgress(primary))}%</small>
          </ProgressRing>
          <div className="goal-hero-info">
            <h2>{primary.title}</h2>
            <p className="num">{formatMoney(primary.savedAmount)} <span className="muted">из</span> {formatMoney(primary.targetAmount)}</p>
            <span className="chip active">{etaLabel(primary.targetAmount - primary.savedAmount, rate)}</span>
            <div className="hero-actions" style={{ marginTop: 12 }}>
              <Button variant="ink" size="sm" onClick={() => openSheet('goalContribute', { id: primary.id })}><Icon name="plus" size={15} />Внести</Button>
              <Button variant="ghost" size="sm" onClick={() => openSheet('goal', { id: primary.id })}><Icon name="pencil" size={14} />Изменить</Button>
            </div>
          </div>
        </section>
      )}

      {others.length > 0 && (
        <Section
          title="Остальные цели"
          actionLabel="Новая цель"
          onAction={() => openSheet('goal', {})}
        />
      )}
      <div className="list">
        {others.map(g => {
          const pct = goalProgress(g)
          const done = pct >= 100
          return (
            <button key={g.id} className="list-row" onClick={() => openSheet('goal', { id: g.id })}>
              <i className="sig" style={{ background: done ? 'var(--income-soft)' : 'var(--primary-xsoft)' }}><span style={{ fontSize: 18 }}>{g.emoji}</span></i>
              <span className="row-main">
                <b>{g.title} {done && <span className="badge ok num">готово</span>}</b>
                <small className="num">{formatMoney(g.savedAmount)} / {formatMoney(g.targetAmount)} · {etaLabel(g.targetAmount - g.savedAmount, rate)}</small>
                <Track pct={pct} state={done ? 'ok' : ''} />
              </span>
              <Icon name="chevR" size={18} className="muted" />
            </button>
          )
        })}
      </div>

      {others.length === 0 && (
        <button className="btn btn-primary btn-block mtop" onClick={() => openSheet('goal', {})}>
          <Icon name="plus" size={16} />Новая цель
        </button>
      )}
    </div>
  )
}
import { useStore, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import { categorySpent, categoryStatus, formatMoney, monthLabel, periodExpense, periodGoalContribution, periodIncome, periodNet } from '../utils/finance'
import { ProgressBar } from '../components/Sheet'
import { TopBar } from '../components/ui/TopBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'

export default function Stats() {
  const { user, categories, operations } = useStore()
  const { openSheet } = useApp()
  const pk = currentPeriodKey()
  const since = user.monthResetAt ?? undefined

  const income = periodIncome(operations, pk, user.periodStartDay, since)
  const expense = periodExpense(operations, pk, user.periodStartDay, since)
  const invested = periodGoalContribution(operations, pk, user.periodStartDay, since)
  const free = periodNet(operations, pk, user.periodStartDay, since)
  const limitTotal = categories.filter(c => !c.isArchived && c.monthlyLimit > 0).reduce((s, c) => s + c.monthlyLimit, 0)
  const over = expense > limitTotal && limitTotal > 0

  const hasData = categories.some(c => !c.isArchived) || operations.length > 0

  if (!hasData) {
    return (
      <div>
        <TopBar title="Статистика" />
        <EmptyState
          icon="📊"
          text={`Пока нет данных за ${monthLabel(pk, user.periodStartDay)}.`}
          action={<Button onClick={() => openSheet('budget')}>Спланировать бюджет</Button>}
        />
      </div>
    )
  }

  return (
    <div>
      <TopBar title="Статистика" subtitle={monthLabel(pk, user.periodStartDay)} />

      <div className="card">
        <div className="card-title">Бюджет месяца</div>
        <div className="muted">{formatMoney(expense)} из {limitTotal > 0 ? formatMoney(limitTotal) : 'не задан'}</div>
        <ProgressBar pct={limitTotal > 0 ? (expense / limitTotal) * 100 : 0} state={over ? 'over' : limitTotal > 0 ? 'ok' : ''} />
        <div className="row" style={{ marginTop: 8 }}>
          <span className="badge" style={{ background: over ? 'var(--red)' : 'var(--green)' }}>
            {over ? 'Превышен' : 'В рамках бюджета'}
          </span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">План / факт</div>
        {categories.filter(c => !c.isArchived).map(c => {
          const spent = categorySpent(operations, c.id, pk, user.periodStartDay, since)
          const st = categoryStatus(c, spent)
          return (
            <div className="cat-row" key={c.id}>
              <div className="cat-emoji" style={{ background: c.color + '33' }}>{c.emoji}</div>
              <div className="cat-info">
                <div className="cat-name">{c.name}</div>
                <ProgressBar pct={st.pct} state={st.state} />
              </div>
              <div className="cat-amount">{formatMoney(st.spent)}<br /><span className="muted" style={{ fontWeight: 400 }}>/ {st.limit > 0 ? formatMoney(st.limit) : '—'}</span></div>
            </div>
          )
        })}
      </div>

      <div className="summary">
        <div className="mini"><div className="lbl">Доход</div><div className="val" style={{ color: 'var(--green)' }}>{formatMoney(income)}</div></div>
        <div className="mini"><div className="lbl">В цели</div><div className="val" style={{ color: 'var(--orange)' }}>{formatMoney(invested)}</div></div>
        <div className="mini"><div className="lbl">Свободно</div><div className="val">{formatMoney(free)}</div></div>
      </div>
    </div>
  )
}
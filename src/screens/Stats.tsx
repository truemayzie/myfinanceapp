import { useStore, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import { categorySpent, categoryStatus, dailyRate, forecastExpense, formatMoney, monthLabel, periodExpense, periodIncome, periodNet } from '../utils/finance'
import { Track } from '../components/Sheet'
import { AppHeader } from '../components/ui/AppHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/icons'
import { iconOf } from '../data/seed'

export default function Stats() {
  const user = useStore(s => s.user)
  const categories = useStore(s => s.categories)
  const operations = useStore(s => s.operations)
  const plans = useStore(s => s.plans)
  const { openSheet } = useApp()
  const pk = currentPeriodKey()
  const since = user.monthResetAt ?? undefined

  const income = periodIncome(operations, pk, user.periodStartDay, since)
  const expense = periodExpense(operations, pk, user.periodStartDay, since)
  const free = periodNet(operations, pk, user.periodStartDay, since)
  const plan = plans.find(p => p.periodKey === pk)

  const limitTotal = categories.filter(c => !c.isArchived && (plan?.categoryLimits?.[c.id] ?? c.monthlyLimit) > 0)
    .reduce((s, c) => s + (plan?.categoryLimits?.[c.id] ?? c.monthlyLimit), 0)
  const over = limitTotal > 0 && expense > limitTotal

  const forecast = forecastExpense(expense, pk, user.periodStartDay)
  const rate = dailyRate(Math.max(0, limitTotal - expense), pk, user.periodStartDay)
  const hasData = operations.length > 0

  if (!hasData) {
    return (
      <div>
        <AppHeader title="Статистика" subtitle={monthLabel(pk, user.periodStartDay)} />
        <EmptyState
          icon="pie"
          title="Нет данных"
          text={`За ${monthLabel(pk, user.periodStartDay).toLowerCase()} пока нет операций.`}
          action={<Button onClick={() => openSheet('quickAdd')}>Записать первый расход</Button>}
        />
      </div>
    )
  }

  return (
    <div>
      <AppHeader title="Статистика" subtitle={monthLabel(pk, user.periodStartDay)} />

      <div className="kpi">
        <div className="kpi-cell">
          <span className="kpi-lbl">Доход</span>
          <b className="kpi-val num" style={{ color: 'var(--income)' }}>{formatMoney(income)}</b>
        </div>
        <div className="kpi-cell">
          <span className="kpi-lbl">Расход</span>
          <b className="kpi-val num">{formatMoney(expense)}</b>
        </div>
        <div className="kpi-cell">
          <span className="kpi-lbl">Свободно</span>
          <b className="kpi-val num" style={{ color: free >= 0 ? undefined : 'var(--danger)' }}>{formatMoney(free)}</b>
        </div>
        <div className="kpi-cell">
          <span className="kpi-lbl">Лимиты</span>
          <b className="kpi-val num">{limitTotal > 0 ? formatMoney(limitTotal) : '—'}</b>
        </div>
      </div>

      <div className="card-prog">
        <div className="prog-head">
          <span>Прогноз по темпу</span>
          {over && <span className="badge danger">превышен</span>}
        </div>
        <div className="prog-row">
          <span className="muted">потрачено</span>
          <b className="num">{formatMoney(expense)}</b>
        </div>
        {limitTotal > 0 && (
          <div className="prog-row">
            <span className="muted">безопасно в день</span>
            <b className="num">{formatMoney(rate)}</b>
          </div>
        )}
        <div className="prog-row">
          <span className="muted">прогноз к концу периода</span>
          <b className="num">{forecast != null ? formatMoney(forecast) : '—'}</b>
        </div>
        <Track pct={limitTotal > 0 ? (expense / limitTotal) * 100 : 0} state={over ? 'over' : limitTotal > 0 && expense / limitTotal > 0.8 ? 'warn' : ''} />
        <p className="insight">
          {limitTotal > 0
            ? over
              ? `Расход уже превышает лимиты на ${formatMoney(expense - limitTotal)}. Пересмотрите план.`
              : `Осталось ${formatMoney(limitTotal - expense)} до лимитов — это примерно ${formatMoney(rate)} в день.`
            : 'Задайте лимиты в плане периода, чтобы видеть прогноз.'}
        </p>
      </div>

      <AppHeader title="План / факт" />
      <div className="list">
        {categories.filter(c => !c.isArchived).map(c => {
          const spent = categorySpent(operations, c.id, pk, user.periodStartDay, since)
          const st = categoryStatus(c, spent)
          return (
            <div key={c.id} className="list-row">
              <i className="sig" style={{ background: c.color }}><Icon name={iconOf(c) as any} size={16} /></i>
              <span className="row-main">
                <b>{c.name}</b>
                <small>{st.limit > 0 ? `${formatMoney(st.spent)} из ${formatMoney(st.limit)}` : `${formatMoney(st.spent)} · без лимита`}</small>
                <Track pct={st.pct} state={st.state} />
              </span>
              {st.state === 'over' && <span className="badge danger num">−{formatMoney(-st.remaining)}</span>}
              {st.state === 'warn' && <span className="row-amount num muted">{formatMoney(st.remaining)}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
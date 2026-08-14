import { useMemo, useState } from 'react'
import { useStore, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import { categorySpent, categoryStatus, daysLeft, formatMoney, goalProgress, monthLabel, periodExpense, periodGoalContribution, periodIncome, periodNet, prevPeriodKey } from '../utils/finance'
import { Track } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Section } from '../components/ui/AppHeader'
import { Icon } from '../components/icons'
import { iconOf } from '../data/seed'

function nextPeriodKey(pk: string): string {
  const [y, m] = pk.split('-').map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function Home() {
  const user = useStore(s => s.user)
  const categories = useStore(s => s.categories)
  const operations = useStore(s => s.operations)
  const goals = useStore(s => s.goals)
  const plans = useStore(s => s.plans)
  const { openSheet, goTab } = useApp()

  const current = currentPeriodKey()
  const [pk, setPk] = useState(current)
  const since = user.monthResetAt ?? undefined

  const plan = plans.find(p => p.periodKey === pk)
  const income = periodIncome(operations, pk, user.periodStartDay, since)
  const expense = periodExpense(operations, pk, user.periodStartDay, since)
  const invested = periodGoalContribution(operations, pk, user.periodStartDay, since)
  const net = periodNet(operations, pk, user.periodStartDay, since)
  const isCurrent = pk === current

  const primary = goals.find(g => g.isPrimary) ?? goals[0] ?? null
  const budgetBase = plan?.incomePlanned || income
  const budgetPct = budgetBase > 0 ? (expense / budgetBase) * 100 : 0

  const activeCats = categories.filter(c => !c.isArchived)
  const spentByCat = useMemo(() => {
    const m = new Map<string, number>()
    operations.forEach(o => {
      if (o.type === 'expense' && o.categoryId && o.date.slice(0, 7) === pk && (!since || o.createdAt >= since)) {
        m.set(o.categoryId, (m.get(o.categoryId) ?? 0) + o.amount)
      }
    })
    return m
  }, [operations, pk, since])

  return (
    <div>
      <div className="app-header home-head">
        <div>
          <div className="greet">Привет, {user.name}</div>
          <div className="period-switch">
            <button className="pch" onClick={() => setPk(prevPeriodKey(pk))}><Icon name="chevL" size={16} /></button>
            <span className="period-name">{monthLabel(pk, user.periodStartDay)}</span>
            <button className="pch" onClick={() => setPk(nextPeriodKey(pk))}><Icon name="chevR" size={16} /></button>
          </div>
        </div>
        <button className="icon-btn" onClick={() => openSheet('history')} title="История"><Icon name="history" size={20} /></button>
      </div>

      <section className={`hero ${isCurrent ? 'current' : 'dim'}`}>
        <div className="hero-top">
          <span className="hero-badge">{isCurrent ? 'Этот период' : 'Сводка'}</span>
          {isCurrent && budgetPct > 100 && <span className="hero-badge warn">Превышен план</span>}
        </div>
        <div className="hero-net">
          <span className="num">{formatMoney(net, user.currency)}</span>
          <i className="hero-note">остаток</i>
        </div>
        <div className="hero-budget">
          {plan ? (
            <>
              <span>потрачено <b className="num">{formatMoney(expense)}</b> из плана {formatMoney(budgetBase)}</span>
              <Track pct={budgetPct} state={budgetPct > 100 ? 'over' : budgetPct > 85 ? 'warn' : ''} />
            </>
          ) : (
            <span>план не задан · расход {formatMoney(expense)}</span>
          )}
        </div>
        <div className="hero-actions">
          <Button variant="ink" size="sm" onClick={() => openSheet('quickAdd')}><Icon name="plus" size={15} />Расход</Button>
          <Button variant="ghost" size="sm" onClick={() => openSheet('add')}><Icon name="arrowDown" size={15} />Доход</Button>
          <Button variant="ghost" size="sm" onClick={() => openSheet('budget')}><Icon name="wallet" size={15} />План</Button>
        </div>
      </section>

      <div className="metric-row">
        <div className="m-cell">
          <i className="m-ico" style={{ background: 'var(--income-soft)' }}><Icon name="arrowDown" size={16} /></i>
          <span className="m-val num">{formatMoney(income)}</span>
          <span className="m-lbl">доход</span>
        </div>
        <div className="m-cell">
          <i className="m-ico" style={{ background: 'var(--danger-soft)' }}><Icon name="arrowUp" size={16} /></i>
          <span className="m-val num">{formatMoney(expense)}</span>
          <span className="m-lbl">расход</span>
        </div>
        <div className="m-cell">
          <i className="m-ico" style={{ background: 'var(--warn-soft)' }}><Icon name="target" size={16} /></i>
          <span className="m-val num">{formatMoney(invested)}</span>
          <span className="m-lbl">в цели</span>
        </div>
      </div>

      {primary && (
        <button className="goal-strip" onClick={() => goTab('goals')}>
          <i className="sig" style={{ background: 'var(--primary-xsoft)' }}><span style={{ fontSize: 18 }}>{primary.emoji}</span></i>
          <span className="row-main">
            <b>{primary.title}</b>
            <small className="num">{formatMoney(primary.savedAmount)} / {formatMoney(primary.targetAmount)}</small>
            <Track pct={goalProgress(primary)} state={goalProgress(primary) >= 100 ? 'ok' : ''} />
          </span>
          <Icon name="chevR" size={18} className="muted" />
        </button>
      )}

      <Section
        title="Бюджет"
        actionLabel="План на период"
        onAction={() => openSheet('budget')}
      />
      <div className="list">
        {activeCats.length === 0 && <div className="muted center pad">Добавьте категории в настройках</div>}
        {activeCats.map(c => {
          const spent = spentByCat.get(c.id) ?? 0
          const st = categoryStatus(c, spent)
          return (
            <button key={c.id} className="list-row" onClick={() => openSheet('history')}>
              <i className="sig" style={{ background: c.color }}><Icon name={iconOf(c) as any} size={16} /></i>
              <span className="row-main">
                <b>{c.name}</b>
                <small className={st.state === 'over' ? 'warn-t' : ''}>
                  {st.limit > 0 ? `осталось ${formatMoney(st.remaining)}` : `потрачено ${formatMoney(spent)}`}
                </small>
                <Track pct={st.pct} state={st.state} />
              </span>
              <span className="row-amount num">{formatMoney(spent)}</span>
            </button>
          )
        })}
      </div>
      <div className="row-actions">
        <button className="link-btn" onClick={() => openSheet('categories')}><Icon name="pencil" size={14} />Категории</button>
        {isCurrent && (
          <button className="link-btn muted" onClick={() => openSheet('tbank')}><Icon name="phone" size={14} />Импорт</button>
        )}
      </div>

      {isCurrent && (
        <p className="footnote">Дней осталось: {daysLeft(pk, user.periodStartDay)} · сброс периода — в настройках</p>
      )}
    </div>
  )
}
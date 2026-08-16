import { useStore, SYNC_ENABLED, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import { daysLeft, formatMoney, goalProgress, monthLabel, periodExpense, periodGoalContribution, periodIncome } from '../utils/finance'
import { Track } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/icons'
import { iconOf } from '../data/seed'

export default function Home() {
  const user = useStore(s => s.user)
  const categories = useStore(s => s.categories)
  const operations = useStore(s => s.operations)
  const goals = useStore(s => s.goals)
  const plans = useStore(s => s.plans)
  const syncMode = useStore(s => s.syncMode)
  const { openSheet, goTab } = useApp()

  const localOnly = SYNC_ENABLED && syncMode === 'local'

  const pk = currentPeriodKey()
  const since = user.monthResetAt ?? undefined

  const plan = plans.find(p => p.periodKey === pk)
  const income = periodIncome(operations, pk, user.periodStartDay, since)
  const expense = periodExpense(operations, pk, user.periodStartDay, since)
  const invested = periodGoalContribution(operations, pk, user.periodStartDay, since)

  const budgetBase = plan?.incomePlanned || income
  const pct = budgetBase > 0 ? (expense / budgetBase) * 100 : 0
  const over = budgetBase > 0 && expense > budgetBase

  const primary = goals.find(g => g.isPrimary) ?? goals[0] ?? null
  const activeCats = categories.filter(c => !c.isArchived)

  const spentByCat = new Map<string, number>()
  operations.forEach(o => {
    if (o.type === 'expense' && o.categoryId && o.date.slice(0, 7) === pk && (!since || o.createdAt >= since)) {
      spentByCat.set(o.categoryId, (spentByCat.get(o.categoryId) ?? 0) + o.amount)
    }
  })
  const rows = activeCats
    .map(c => ({ cat: c, spent: spentByCat.get(c.id) ?? 0 }))
    .sort((a, b) => b.spent - a.spent)

  const left = daysLeft(pk, user.periodStartDay)

  return (
    <div>
      <div className="app-header home-head">
        <div>
          <div className="greet">Привет, {user.name}</div>
          <div className="period-line">
            {monthLabel(pk, user.periodStartDay)} · осталось {left} {plural(left, 'день', 'дня', 'дней')}
          </div>
        </div>
        <button className="icon-btn" onClick={() => openSheet('history')} title="История"><Icon name="history" size={20} /></button>
      </div>

      <section className="hero">
        <div className="hero-top">
          <span className={`hero-badge ${over ? 'warn' : ''}`}>{over ? 'Превышен план' : 'Этот период'}</span>
          <span className="hero-days">{left} {plural(left, 'день', 'дня', 'дней')} осталось</span>
        </div>
        <div className="hero-label">Потрачено</div>
        <div className="hero-expense">
          <span className="num">{formatMoney(expense)}</span>
          {budgetBase > 0 && <span className="of">из {formatMoney(budgetBase)}</span>}
        </div>
        {budgetBase > 0 && <Track pct={pct} state={over ? 'over' : pct > 85 ? 'warn' : ''} />}
        <div className="hero-subline">
          {budgetBase > 0 ? `${Math.round(pct)}% плана` : 'План не задан'}
          {budgetBase <= 0 && <button className="link-btn hero-link" onClick={() => openSheet('budget')}>задать</button>}
        </div>
        <div className="hero-actions">
          <Button className="btn-hero" block onClick={() => openSheet('quickAdd')}>
            <Icon name="plus" size={17} />Записать трату
          </Button>
        </div>
      </section>

      <div className="section">
        <div className="section-head">
          <h2 className="section-title">Куда ушли деньги</h2>
          <button className="section-action" onClick={() => openSheet('history')}>вся история</button>
        </div>
        <div className="list">
          {rows.length === 0 && (
            <div className="muted center pad">Пока нет трат за период</div>
          )}
          {rows.map(({ cat, spent }) => (
            <button key={cat.id} className="list-row" onClick={() => openSheet('quickAdd')}>
              <i className="sig" style={{ background: cat.color }}><Icon name={iconOf(cat) as any} size={16} /></i>
              <span className="row-main"><b>{cat.name}</b></span>
              <span className="row-amount num">{spent > 0 ? formatMoney(spent) : '—'}</span>
            </button>
          ))}
          {rows.length > 0 && (
            <div className="list-total">
              <span className="lbl">Потрачено всего</span>
              <span className="num">−{formatMoney(expense)}</span>
            </div>
          )}
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

      <p className="sumline">
        <b className="num">{income > 0 ? `+${formatMoney(income)}` : 'доход не записан'}</b>
        {invested > 0 && <span className="num">· в цель {formatMoney(invested)}</span>}
      </p>

      {localOnly && (
        <div className="sync-note">
          <Icon name="alert" size={14} />
          <span>Открыто вне Telegram — данные видны только на этом устройстве. Откройте приложение через Telegram, чтобы синхронизировать.</span>
        </div>
      )}
      {SYNC_ENABLED && syncMode === 'cloud' && (
        <div className="sync-note ok">
          <Icon name="check" size={14} />
          <span>Данные синхронизированы с облаком</span>
        </div>
      )}
    </div>
  )
}

function plural(n: number, one: string, two: string, five: string): string {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return two
  return five
}
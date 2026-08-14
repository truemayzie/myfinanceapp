import { useStore, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import { categorySpent, categoryStatus, daysLeft, formatMoney, goalProgress, monthLabel, periodExpense, periodIncome } from '../utils/finance'
import { ProgressBar } from '../components/Sheet'

export default function Home() {
  const { user, categories, operations, goals } = useStore()
  const { openSheet, goTab } = useApp()
  const pk = currentPeriodKey()

  const primary = goals.find(g => g.isPrimary) ?? goals[0] ?? null
  const income = periodIncome(operations, pk, user.periodStartDay)
  const expense = periodExpense(operations, pk, user.periodStartDay)
  const remaining = income - expense

  return (
    <div>
      <div className="topbar">
        <div>Привет, {user.name} 👋</div>
        <h1>{monthLabel(pk, user.periodStartDay)}</h1>
      </div>

      {primary && (
        <div className="card">
          <div className="card-title">Моя цель <a onClick={() => goTab('goals')}>Все цели</a></div>
          <div className="goal-cover" style={{ height: 90 }}>{primary.emoji || '🎯'}</div>
          <div className="row">
            <span className="badge">Основная</span>
            <b style={{ fontSize: 16 }}>{primary.title}</b>
          </div>
          <div className="muted" style={{ fontSize: 13, margin: '6px 0' }}>
            {formatMoney(primary.savedAmount)} из {formatMoney(primary.targetAmount)}
          </div>
          <ProgressBar pct={goalProgress(primary)} state={goalProgress(primary) >= 100 ? 'ok' : ''} />
          <button className="primary-btn" style={{ marginTop: 12 }} onClick={() => openSheet('goalContribute', { id: primary.id })}>
            + Добавить
          </button>
        </div>
      )}

      <div className="card">
        <div className="muted" style={{ fontSize: 13 }}>Осталось в этом месяце</div>
        <div className="big-amount">{formatMoney(remaining, user.currency)}</div>
        <div className="summary">
          <div className="mini"><div className="lbl">Доход</div><div className="val" style={{ color: 'var(--green)' }}>{formatMoney(income)}</div></div>
          <div className="mini"><div className="lbl">Потрачено</div><div className="val" style={{ color: 'var(--accent2)' }}>{formatMoney(expense)}</div></div>
        </div>
      </div>

      <div className="cta" onClick={() => openSheet('budget')}>
        <div className="cta-ico">📊</div>
        <div className="spacer">
          <div className="cta-title">Спланировать бюджет</div>
          <div className="cta-sub">Распределите доход по категориям</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Категории <a onClick={() => openSheet('category')}>Изменить</a></div>
        {categories.filter(c => !c.isArchived).map(c => {
          const spent = categorySpent(operations, c.id, pk, user.periodStartDay)
          const st = categoryStatus(c, spent)
          return (
            <div className="cat-row" key={c.id}>
              <div className="cat-emoji" style={{ background: c.color + '33' }}>{c.emoji}</div>
              <div className="cat-info">
                <div className="cat-name">{c.name}</div>
                <div className="cat-sub">{formatMoney(st.spent)} / {st.limit > 0 ? formatMoney(st.limit) : '—'}</div>
                <ProgressBar pct={st.pct} state={st.state} />
              </div>
              <div className="cat-amount">
                {st.state !== 'none' && (
                  <span className={`rem ${st.state}`}>
                    {st.state === 'over' ? `−${formatMoney(-st.remaining)}` : `ост. ${formatMoney(st.remaining)}`}
                  </span>
                )}
                <span className="muted" style={{ fontSize: 11 }}>{daysLeft(pk, user.periodStartDay)} дн.</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

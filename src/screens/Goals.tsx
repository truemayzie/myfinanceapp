import { useStore } from '../store/useStore'
import { useApp } from '../AppContext'
import { formatMoney, goalProgress } from '../utils/finance'
import { ProgressBar } from '../components/Sheet'

export default function Goals() {
  const { goals, updateGoal, deleteGoal, setPrimaryGoal } = useStore()
  const { openSheet, showToast } = useApp()

  return (
    <div>
      <div className="topbar"><h1>Мои цели</h1></div>
      <p className="muted" style={{ marginTop: 0, fontSize: 13, padding: '0 16px' }}>Выберите основную — она будет на главной.</p>

      {goals.map(g => {
        const pct = goalProgress(g)
        return (
          <div className="card" key={g.id}>
            <div className="goal-cover" style={{ height: 100 }}>{g.emoji || '🎯'}</div>
            <div className="row">
              {g.isPrimary && <span className="badge">Основная</span>}
              <b style={{ fontSize: 16, flex: 1 }}>{g.title}</b>
            </div>
            <div className="muted" style={{ fontSize: 13, margin: '6px 0' }}>
              {formatMoney(g.savedAmount)} из {formatMoney(g.targetAmount)} · {Math.round(pct)}%
            </div>
            <ProgressBar pct={pct} state={pct >= 100 ? 'ok' : ''} />
            <div className="row" style={{ marginTop: 12, gap: 8 }}>
              <button className="primary-btn" style={{ flex: 1 }} onClick={() => openSheet('goalContribute', { id: g.id })}>+ Пополнить</button>
              <button className="ghost-btn" style={{ flex: 1 }} onClick={() => openSheet('goal', { id: g.id })}>Изменить</button>
            </div>
            <div className="row" style={{ marginTop: 8, gap: 8 }}>
              {!g.isPrimary && (
                <button className="ghost-btn" style={{ flex: 1 }} onClick={() => { setPrimaryGoal(g.id); showToast('Сделана основной') }}>Сделать основной</button>
              )}
              <button className="danger-btn" style={{ flex: 1 }} onClick={() => { if (confirm('Удалить цель?')) deleteGoal(g.id) }}>Удалить</button>
            </div>
          </div>
        )
      })}

      <button className="dashed-btn" onClick={() => openSheet('goal')}>+ Добавить цель</button>
    </div>
  )
}

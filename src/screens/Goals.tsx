import { useStore } from '../store/useStore'
import { useApp } from '../AppContext'
import { formatMoney, goalProgress } from '../utils/finance'
import { ProgressBar } from '../components/Sheet'
import { TopBar } from '../components/ui/TopBar'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'

export default function Goals() {
  const { goals, deleteGoal, setPrimaryGoal } = useStore()
  const { openSheet, showToast } = useApp()

  return (
    <div>
      <TopBar title="Мои цели" />
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
              <Button style={{ flex: 1 }} onClick={() => openSheet('goalContribute', { id: g.id })}>+ Пополнить</Button>
              <Button variant="ghost" style={{ flex: 1 }} onClick={() => openSheet('goal', { id: g.id })}>Изменить</Button>
            </div>
            <div className="row" style={{ marginTop: 8, gap: 8 }}>
              {!g.isPrimary && (
                <Button variant="ghost" style={{ flex: 1 }} onClick={() => { setPrimaryGoal(g.id); showToast('Сделана основной') }}>Сделать основной</Button>
              )}
              <Button variant="danger" style={{ flex: 1 }} onClick={() => { if (confirm('Удалить цель?')) deleteGoal(g.id) }}>Удалить</Button>
            </div>
          </div>
        )
      })}

      {goals.length === 0 && <EmptyState icon="🎯" text="Целей пока нет. Поставьте первую — она появится на главной." />}

      <Button variant="dashed" onClick={() => openSheet('goal')}>+ Добавить цель</Button>
    </div>
  )
}
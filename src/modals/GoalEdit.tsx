import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { useApp } from '../AppContext'
import { GOAL_EMOJIS } from '../data/seed'
import type { Goal } from '../types'

export default function GoalEdit({ onClose, editId }: { onClose: () => void; editId?: string | null }) {
  const { showToast } = useApp()
  const goals = useStore(s => s.goals)
  const addGoal = useStore(s => s.addGoal)
  const updateGoal = useStore(s => s.updateGoal)
  const deleteGoal = useStore(s => s.deleteGoal)
  const editing = goals.find(g => g.id === editId)

  const [title, setTitle] = useState(editing?.title ?? '')
  const [target, setTarget] = useState(editing ? String(editing.targetAmount) : '')
  const [icon, setIcon] = useState(editing?.emoji ?? GOAL_EMOJIS[0])

  const save = () => {
    const t = parseInt(target, 10)
    if (!title.trim() || !t || t <= 0) return
    if (editing) {
      updateGoal(editing.id, { title: title.trim(), targetAmount: t, emoji: icon })
    } else {
      addGoal({ title: title.trim(), targetAmount: t, savedAmount: 0, emoji: icon, isPrimary: goals.length === 0, status: 'active' })
    }
    showToast(editing ? 'Цель обновлена' : 'Цель создана')
    onClose()
  }

  return (
    <Sheet title={editing ? 'Цель' : 'Новая цель'} onClose={onClose}>
      <Field label="Название">
        <input className="input" value={title} placeholder="Подушка безопасности" onChange={e => setTitle(e.target.value)} autoFocus />
      </Field>

      <Field label="Сумма цели (₽)">
        <input className="input" type="tel" inputMode="numeric" value={target} onChange={e => setTarget(e.target.value.replace(/[^\d]/g, ''))} />
      </Field>

      <Field label="Иконка">
        <div className="chip-row">
          {GOAL_EMOJIS.map(e => (
            <button key={e} className={`chip ${icon === e ? 'active' : ''}`} onClick={() => setIcon(e)}>{e}</button>
          ))}
        </div>
      </Field>

      <div className="sheet-actions">
        {editing && (
          <Button variant="danger" onClick={() => { deleteGoal(editing.id); showToast('Цель удалена'); onClose() }}>
            Удалить
          </Button>
        )}
        <Button variant="ink" onClick={save}>Сохранить</Button>
      </div>
    </Sheet>
  )
}
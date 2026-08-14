import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { PALETTE, uid } from '../data/seed'
import { haptic } from '../telegram'

const EMOJIS = ['🎯', '🚗', '🏠', '✈️', '💻', '📱', '💍', '🎓', '🎮', '🐱', '🏖️', '🛡️']

export default function GoalEdit({ onClose, editId }: { onClose: () => void; editId?: string }) {
  const { goals, addGoal, updateGoal } = useStore()
  const existing = goals.find(g => g.id === editId)
  const [title, setTitle] = useState(existing?.title ?? '')
  const [target, setTarget] = useState(existing?.targetAmount ?? 0)
  const [saved, setSaved] = useState(existing?.savedAmount ?? 0)
  const [emoji, setEmoji] = useState(existing?.emoji ?? '🎯')
  const [deadline, setDeadline] = useState(existing?.deadline ?? '')
  const [isPrimary, setIsPrimary] = useState(existing?.isPrimary ?? goals.length === 0)

  const save = () => {
    if (!title.trim()) return
    const data = { title, targetAmount: Number(target) || 0, savedAmount: Number(saved) || 0, emoji, deadline: deadline || null, isPrimary, status: 'active' as const, coverImage: '' }
    if (existing) updateGoal(existing.id, data)
    else addGoal(data)
    haptic('success')
    onClose()
  }

  return (
    <Sheet title={existing ? 'Редактировать цель' : 'Новая цель'} onClose={onClose}>
      <div className="field">
        <label>Эмодзи</label>
        <div className="chip-grid">
          {EMOJIS.map(e => <button key={e} className={`chip ${emoji === e ? 'on' : ''}`} onClick={() => setEmoji(e)}>{e}</button>)}
        </div>
      </div>
      <div className="field"><label>Название</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Накопить на отпуск" /></div>
      <div className="field"><label>Целевая сумма</label><input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} /></div>
      <div className="field"><label>Уже накоплено</label><input type="number" value={saved} onChange={e => setSaved(Number(e.target.value))} /></div>
      <div className="field"><label>Срок (необязательно)</label><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
      <div className="field row">
        <span>Сделать основной</span><span className="spacer" />
        <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} />
      </div>
      <button className="primary-btn" onClick={save}>Сохранить</button>
    </Sheet>
  )
}

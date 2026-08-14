import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { GOAL_EMOJIS } from '../data/seed'
import { haptic } from '../telegram'

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
    const data = {
      title: title.trim(),
      targetAmount: Number(target) || 0,
      savedAmount: Number(saved) || 0,
      emoji,
      deadline: deadline || null,
      isPrimary,
      status: 'active' as const,
      coverImage: '',
    }
    if (existing) updateGoal(existing.id, data)
    else addGoal(data)
    haptic('success')
    onClose()
  }

  return (
    <Sheet title={existing ? 'Редактировать цель' : 'Новая цель'} onClose={onClose}>
      <Field label="Эмодзи">
        <div className="chip-grid">
          {GOAL_EMOJIS.map(e => (
            <button key={e} className={`chip ${emoji === e ? 'on' : ''}`} onClick={() => setEmoji(e)}>{e}</button>
          ))}
        </div>
      </Field>
      <Field label="Название"><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Накопить на отпуск" /></Field>
      <Field label="Целевая сумма"><input type="number" inputMode="decimal" value={target} onChange={e => setTarget(Number(e.target.value))} /></Field>
      <Field label="Уже накоплено"><input type="number" inputMode="decimal" value={saved} onChange={e => setSaved(Number(e.target.value))} /></Field>
      <Field label="Срок (необязательно)"><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></Field>
      <div className="field row">
        <span>Сделать основной</span><span className="spacer" />
        <input type="checkbox" checked={isPrimary} onChange={e => setIsPrimary(e.target.checked)} />
      </div>
      <Button onClick={save}>Сохранить</Button>
    </Sheet>
  )
}
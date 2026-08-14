import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { formatMoney } from '../utils/finance'
import { haptic } from '../telegram'

export default function GoalContribute({ onClose, goalId }: { onClose: () => void; goalId: string }) {
  const { goals, contributeGoal } = useStore()
  const goal = goals.find(g => g.id === goalId)
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')

  if (!goal) return null

  const save = () => {
    const a = Number(amount)
    if (!Number.isFinite(a) || a <= 0) return
    contributeGoal(goalId, a, comment)
    haptic('success')
    onClose()
  }

  return (
    <Sheet title={`Пополнить: ${goal.title}`} onClose={onClose}>
      <div className="muted" style={{ marginBottom: 12 }}>Накоплено {formatMoney(goal.savedAmount)} из {formatMoney(goal.targetAmount)}</div>
      <div className="field"><label>Сумма пополнения</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} autoFocus /></div>
      <div className="field"><label>Комментарий</label><input value={comment} onChange={e => setComment(e.target.value)} placeholder="откуда деньги" /></div>
      <button className="primary-btn" onClick={save}>Пополнить</button>
    </Sheet>
  )
}

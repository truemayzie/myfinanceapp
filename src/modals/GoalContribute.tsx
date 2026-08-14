import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { useApp } from '../AppContext'

export default function GoalContribute({ onClose, goalId }: { onClose: () => void; goalId?: string | null }) {
  const { showToast } = useApp()
  const goal = useStore(s => s.goals.find(g => g.id === goalId))
  const contributeGoal = useStore(s => s.contributeGoal)
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')

  if (!goal) return null

  const submit = () => {
    const a = parseInt(amount, 10)
    if (!a || a <= 0) return
    contributeGoal(goal.id, a, comment)
    showToast('Внесено в цель')
    onClose()
  }

  return (
    <Sheet title={goal.title} onClose={onClose}>
      <Field label="Сумма (₽)">
        <input className="input" type="tel" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))} autoFocus />
      </Field>
      <Field label="Комментарий">
        <input className="input" placeholder="Сдача с недели" value={comment} onChange={e => setComment(e.target.value)} />
      </Field>
      <Button block onClick={submit}>Внести</Button>
    </Sheet>
  )
}
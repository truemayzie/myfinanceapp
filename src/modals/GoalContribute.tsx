import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet, Track } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { AmountInput, Field, Input } from '../components/ui/Field'
import { Chip, ChipRow } from '../components/ui/Segmented'
import { useApp } from '../AppContext'
import { formatMoney, goalProgress } from '../utils/finance'

const PRESETS = [1000, 3000, 5000, 10000]

export default function GoalContribute({ onClose, goalId }: { onClose: () => void; goalId?: string | null }) {
  const { showToast } = useApp()
  const goal = useStore(s => s.goals.find(g => g.id === goalId))
  const currency = useStore(s => s.user.currency)
  const contributeGoal = useStore(s => s.contributeGoal)
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')

  if (!goal) return null

  const value = parseInt(amount, 10) || 0
  const remaining = Math.max(0, goal.targetAmount - goal.savedAmount)
  const after = Math.min(100, ((goal.savedAmount + value) / Math.max(1, goal.targetAmount)) * 100)

  const submit = () => {
    if (value <= 0) return
    contributeGoal(goal.id, value, comment)
    showToast('Внесено в цель')
    onClose()
  }

  return (
    <Sheet title={goal.title} eyebrow="Пополнение цели" onClose={onClose}>
      <div className="mb-6 rounded-card bg-surface-2 p-4">
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-[22px] shadow-tile">
            {goal.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="num text-[13px] font-bold">
              {formatMoney(goal.savedAmount, currency)}{' '}
              <span className="font-semibold text-pale">из {formatMoney(goal.targetAmount, currency)}</span>
            </p>
            <small className="mt-0.5 block text-[11px] text-faint">
              {remaining > 0 ? `осталось ${formatMoney(remaining, currency)}` : 'цель достигнута'}
            </small>
          </div>
        </div>
        <div className="mt-3.5">
          <Track pct={value > 0 ? after : goalProgress(goal)} state={after >= 100 ? 'ok' : ''} className="h-1.5" />
        </div>
        {value > 0 && (
          <p className="mt-2.5 text-[11px] font-bold text-brand">
            После пополнения: {Math.round(after)}% · {formatMoney(goal.savedAmount + value, currency)}
          </p>
        )}
      </div>

      <Field label="Сумма">
        <AmountInput
          currency={currency}
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))}
          autoFocus
        />
      </Field>

      <ChipRow className="mb-5">
        {PRESETS.map(a => (
          <Chip key={a} active={value === a} onClick={() => setAmount(String(a))}>
            {a.toLocaleString('ru-RU')} {currency}
          </Chip>
        ))}
        {remaining > 0 && (
          <Chip active={value === remaining} onClick={() => setAmount(String(remaining))}>
            всё до цели
          </Chip>
        )}
      </ChipRow>

      <Field label="Комментарий">
        <Input placeholder="Сдача с недели" value={comment} onChange={e => setComment(e.target.value)} />
      </Field>

      <Button block disabled={value <= 0} onClick={submit}>
        Внести {value > 0 ? formatMoney(value, currency) : ''}
      </Button>
    </Sheet>
  )
}

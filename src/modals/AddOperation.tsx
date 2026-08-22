import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { AmountInput, Field, Input } from '../components/ui/Field'
import { Chip, ChipRow, Segmented } from '../components/ui/Segmented'
import { Icon } from '../components/icons'
import { useApp } from '../AppContext'
import { iconOf } from '../data/seed'

type OpType = 'expense' | 'income' | 'goal_contribution'

export default function AddOperation({ onClose }: { onClose: () => void }) {
  const { showToast } = useApp()
  const categories = useStore(s => s.categories.filter(c => !c.isArchived))
  const goals = useStore(s => s.goals.filter(g => g.status === 'active'))
  const currency = useStore(s => s.user.currency)
  const addOperation = useStore(s => s.addOperation)
  const contributeGoal = useStore(s => s.contributeGoal)

  const [type, setType] = useState<OpType>('expense')
  const [amount, setAmount] = useState('')
  const [catId, setCatId] = useState<string | null>(categories[0]?.id ?? null)
  const [goalId, setGoalId] = useState<string | null>(goals[0]?.id ?? null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [comment, setComment] = useState('')

  const value = parseInt(amount || '0', 10)

  const submit = () => {
    if (value <= 0) return
    if (type === 'goal_contribution') {
      if (!goalId) return
      contributeGoal(goalId, value, comment)
    } else {
      addOperation({
        type,
        amount: value,
        categoryId: type === 'expense' ? catId : null,
        goalId: null,
        date,
        comment,
      })
    }
    showToast(type === 'income' ? 'Доход добавлен' : type === 'expense' ? 'Расход записан' : 'В цель добавлено')
    onClose()
  }

  return (
    <Sheet title="Новая операция" eyebrow="Подробно" onClose={onClose}>
      <Segmented
        className="mb-5"
        value={type}
        onChange={setType}
        options={[
          { value: 'expense', label: 'Расход' },
          { value: 'income', label: 'Доход' },
          { value: 'goal_contribution', label: 'В цель' },
        ]}
      />

      <Field label="Сумма">
        <AmountInput
          currency={currency}
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))}
          autoFocus
        />
      </Field>

      {type === 'expense' && (
        <Field label="Категория">
          <ChipRow>
            {categories.map(c => (
              <Chip key={c.id} active={catId === c.id} onClick={() => setCatId(c.id)}>
                <Icon name={iconOf(c)} size={15} />
                {c.name}
              </Chip>
            ))}
          </ChipRow>
        </Field>
      )}

      {type === 'goal_contribution' && (
        <Field label="Цель">
          {goals.length > 0 ? (
            <ChipRow>
              {goals.map(g => (
                <Chip key={g.id} active={goalId === g.id} onClick={() => setGoalId(g.id)}>
                  <span>{g.emoji}</span>
                  {g.title}
                </Chip>
              ))}
            </ChipRow>
          ) : (
            <p className="rounded-tile bg-surface-2 px-4 py-3 text-[11px] font-semibold text-muted">
              Активных целей нет — создайте цель на вкладке «Цели».
            </p>
          )}
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Дата">
          <Input type="date" value={date} max={new Date().toISOString().slice(0, 10)} onChange={e => setDate(e.target.value)} />
        </Field>
        <Field label="Комментарий">
          <Input placeholder="Обед в кафе" value={comment} onChange={e => setComment(e.target.value)} />
        </Field>
      </div>

      <Button
        block
        className="mt-2"
        disabled={value <= 0 || (type === 'goal_contribution' && !goalId)}
        onClick={submit}
      >
        Сохранить
      </Button>
    </Sheet>
  )
}

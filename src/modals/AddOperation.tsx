import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Icon } from '../components/icons'
import { useApp } from '../AppContext'
import { iconOf } from '../data/seed'

type OpType = 'expense' | 'income' | 'goal_contribution'

export default function AddOperation({ onClose }: { onClose: () => void }) {
  const { showToast } = useApp()
  const categories = useStore(s => s.categories.filter(c => !c.isArchived))
  const goals = useStore(s => s.goals.filter(g => g.status === 'active'))
  const addOperation = useStore(s => s.addOperation)
  const contributeGoal = useStore(s => s.contributeGoal)

  const [type, setType] = useState<OpType>('expense')
  const [amount, setAmount] = useState('')
  const [catId, setCatId] = useState<string | null>(categories[0]?.id ?? null)
  const [goalId, setGoalId] = useState<string | null>(goals[0]?.id ?? null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [comment, setComment] = useState('')

  const submit = () => {
    const a = parseFloat(amount.replace(/\s/g, '').replace(',', '.'))
    if (!a || a <= 0) return
    if (type === 'goal_contribution' && goalId) contributeGoal(goalId, a, comment)
    else addOperation({ type, amount: a, categoryId: type === 'expense' ? catId : null, goalId: null, date, comment })
    showToast(type === 'income' ? 'Доход добавлен' : type === 'expense' ? 'Расход записан' : 'В цель добавлено')
    onClose()
  }

  return (
    <Sheet title="Новая операция" onClose={onClose}>
      <div className="seg">
        <button className={`seg-btn ${type === 'expense' ? 'active' : ''}`} onClick={() => setType('expense')}>Расход</button>
        <button className={`seg-btn ${type === 'income' ? 'active' : ''}`} onClick={() => setType('income')}>Доход</button>
        <button className={`seg-btn ${type === 'goal_contribution' ? 'active' : ''}`} onClick={() => setType('goal_contribution')}>В цель</button>
      </div>

      <Field label="Сумма">
        <input className="amount-input" type="tel" inputMode="numeric" placeholder="0" value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d,. ]/g, ''))} autoFocus />
      </Field>

      {type === 'expense' && (
        <Field label="Категория">
          <div className="chip-row">
            {categories.map(c => (
              <button key={c.id} className={`chip ${catId === c.id ? 'active' : ''}`} onClick={() => setCatId(c.id)}>
                <Icon name={iconOf(c) as any} size={15} />{c.name}
              </button>
            ))}
          </div>
        </Field>
      )}

      {type === 'goal_contribution' && goals.length > 0 && (
        <Field label="Цель">
          <div className="chip-row">
            {goals.map(g => (
              <button key={g.id} className={`chip ${goalId === g.id ? 'active' : ''}`} onClick={() => setGoalId(g.id)}>
                {g.emoji}{g.title}
              </button>
            ))}
          </div>
        </Field>
      )}

      <Field label="Дата">
        <input type="date" className="input" value={date} max={new Date().toISOString().slice(0, 10)} onChange={e => setDate(e.target.value)} />
      </Field>

      <Field label="Комментарий">
        <input className="input" placeholder="Оплата обеда" value={comment} onChange={e => setComment(e.target.value)} />
      </Field>

      <Button block onClick={submit}>Сохранить</Button>
    </Sheet>
  )
}
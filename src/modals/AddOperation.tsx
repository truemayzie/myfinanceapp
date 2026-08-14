import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useApp } from '../AppContext'
import { Sheet } from '../components/Sheet'
import { haptic } from '../telegram'

export default function AddOperation({ onClose }: { onClose: () => void }) {
  const { categories, addOperation } = useStore()
  const { showToast } = useApp()
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [catId, setCatId] = useState<string | null>(categories[0]?.id ?? null)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [comment, setComment] = useState('')

  const save = () => {
    const a = Number(amount)
    if (!Number.isFinite(a) || a <= 0) { showToast('Введите сумму'); return }
    addOperation({ type, amount: a, categoryId: type === 'expense' ? catId : null, date, comment })
    haptic('success')
    showToast(type === 'expense' ? 'Расход добавлен' : 'Доход добавлен')
    onClose()
  }

  return (
    <Sheet title="Добавить операцию" onClose={onClose}>
      <div className="segment" style={{ marginBottom: 14 }}>
        <button className={type === 'expense' ? 'on' : ''} onClick={() => setType('expense')}>Расход</button>
        <button className={type === 'income' ? 'on' : ''} onClick={() => setType('income')}>Доход</button>
      </div>
      <div className="field">
        <label>Сумма</label>
        <input type="number" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" autoFocus />
      </div>
      {type === 'expense' && (
        <div className="field">
          <label>Категория</label>
          <div className="chip-grid">
            {categories.filter(c => !c.isArchived).map(c => (
              <button key={c.id} className={`chip ${catId === c.id ? 'on' : ''}`} onClick={() => setCatId(c.id)}>{c.emoji} {c.name}</button>
            ))}
          </div>
        </div>
      )}
      <div className="field">
        <label>Дата</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div className="field">
        <label>Комментарий</label>
        <input value={comment} onChange={e => setComment(e.target.value)} placeholder="необязательно" />
      </div>
      <button className="primary-btn" onClick={save}>Сохранить</button>
    </Sheet>
  )
}

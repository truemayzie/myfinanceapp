import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Icon } from '../components/icons'
import { useApp } from '../AppContext'
import { iconOf } from '../data/seed'

const PRESET_FOOD = [300, 500, 1000]
const PRESET_OTHER = [100, 500, 2000]

export default function QuickAdd({ onClose }: { onClose: () => void }) {
  const { showToast } = useApp()
  const categories = useStore(s => s.categories.filter(c => !c.isArchived))
  const addOperation = useStore(s => s.addOperation)
  const [amount, setAmount] = useState('')
  const [catId, setCatId] = useState<string | null>(categories[0]?.id ?? null)
  const [isIncome, setIsIncome] = useState(false)

  const presets = useMemo(() => (isIncome ? [5000, 10000, 20000] : PRESET_FOOD), [isIncome])

  const submit = (a: number) => {
    if (a <= 0 || !catId) return
    addOperation({ type: isIncome ? 'income' : 'expense', amount: a, categoryId: isIncome ? null : catId })
    showToast(isIncome ? 'Доход добавлен' : 'Расход записан')
    onClose()
  }

  return (
    <Sheet title={isIncome ? 'Доход' : 'Расход'} onClose={onClose}>
      <div className="seg" style={{ display: 'flex', marginBottom: 16 }}>
        <button className={`seg-btn ${!isIncome ? 'active' : ''}`} onClick={() => setIsIncome(false)}>Расход</button>
        <button className={`seg-btn ${isIncome ? 'active' : ''}`} onClick={() => setIsIncome(true)}>Доход</button>
      </div>

      <div className="amount-num">
        <input
          className="amount-input"
          type="tel"
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))}
          autoFocus
        />
        <span className="cur">₽</span>
      </div>

      {!isIncome && (
        <div className="chip-row">
          {categories.map(c => (
            <button key={c.id} className={`chip ${catId === c.id ? 'active' : ''}`} onClick={() => setCatId(c.id)}>
              <Icon name={iconOf(c) as any} size={16} />{c.name}
            </button>
          ))}
        </div>
      )}

      <div className="qa-preset">
        <button className="qa-btn" onClick={() => submit(parseInt(amount || '0', 10))}>Записать</button>
      </div>
      <div className="chip-row" style={{ justifyContent: 'center' }}>
        {presets.map(a => (
          <button key={a} className="chip" onClick={() => submit(a)}>{a.toLocaleString('ru-RU')} ₽</button>
        ))}
      </div>
    </Sheet>
  )
}
import { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Chip, ChipRow, Segmented } from '../components/ui/Segmented'
import { AmountInput } from '../components/ui/Field'
import { Icon } from '../components/icons'
import { useApp } from '../AppContext'
import { iconOf } from '../data/seed'

const PRESET_EXPENSE = [300, 500, 1000, 2000]
const PRESET_INCOME = [5000, 10000, 20000, 50000]

export default function QuickAdd({ onClose }: { onClose: () => void }) {
  const { showToast, openSheet } = useApp()
  const categories = useStore(s => s.categories.filter(c => !c.isArchived))
  const currency = useStore(s => s.user.currency)
  const addOperation = useStore(s => s.addOperation)
  const [amount, setAmount] = useState('')
  const [catId, setCatId] = useState<string | null>(categories[0]?.id ?? null)
  const [isIncome, setIsIncome] = useState(false)

  const presets = useMemo(() => (isIncome ? PRESET_INCOME : PRESET_EXPENSE), [isIncome])
  const value = parseInt(amount || '0', 10)

  const submit = (a: number) => {
    if (a <= 0) return
    if (!isIncome && !catId) return
    addOperation({ type: isIncome ? 'income' : 'expense', amount: a, categoryId: isIncome ? null : catId })
    showToast(isIncome ? 'Доход добавлен' : 'Расход записан')
    onClose()
  }

  return (
    <Sheet
      title={isIncome ? 'Быстрый доход' : 'Быстрый расход'}
      eyebrow="Одним касанием"
      onClose={onClose}
    >
      <Segmented
        className="mb-5"
        value={isIncome ? 'income' : 'expense'}
        onChange={v => setIsIncome(v === 'income')}
        options={[
          { value: 'expense', label: 'Расход' },
          { value: 'income', label: 'Доход' },
        ]}
      />

      <AmountInput
        currency={currency}
        value={amount}
        onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))}
        autoFocus
        className="py-4 text-[28px]"
      />

      <ChipRow className="mt-3 justify-center">
        {presets.map(a => (
          <Chip key={a} onClick={() => setAmount(String(a))} active={value === a}>
            {a.toLocaleString('ru-RU')} {currency}
          </Chip>
        ))}
      </ChipRow>

      {!isIncome && (
        <>
          <p className="eyebrow mb-2.5 mt-6">Категория</p>
          <ChipRow>
            {categories.map(c => (
              <Chip key={c.id} active={catId === c.id} onClick={() => setCatId(c.id)}>
                <Icon name={iconOf(c)} size={15} />
                {c.name}
              </Chip>
            ))}
          </ChipRow>
        </>
      )}

      <Button block className="mt-6" disabled={value <= 0} onClick={() => submit(value)}>
        Записать {value > 0 ? `${value.toLocaleString('ru-RU')} ${currency}` : ''}
      </Button>
      <button
        onClick={() => openSheet('add')}
        className="mt-3 block w-full text-center text-xs font-bold text-brand hover:underline"
      >
        Указать дату и комментарий
      </button>
    </Sheet>
  )
}

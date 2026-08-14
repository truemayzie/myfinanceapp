import { useState } from 'react'
import { useStore, currentPeriodKey } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { formatMoney, periodIncome } from '../utils/finance'
import { haptic } from '../telegram'

export default function BudgetPlan({ onClose }: { onClose: () => void }) {
  const { user, categories, savePlan, updateCategory, plans, operations } = useStore()
  const pk = currentPeriodKey()
  const since = user.monthResetAt ?? undefined
  const existing = plans.find(p => p.periodKey === pk)

  const [income, setIncome] = useState(existing?.incomePlanned ?? periodIncome(operations, pk, user.periodStartDay, since))
  const [limits, setLimits] = useState<Record<string, number>>(
    existing?.categoryLimits ??
    Object.fromEntries(categories.filter(c => !c.isArchived).map(c => [c.id, c.monthlyLimit])),
  )

  const allocated = Object.values(limits).reduce((s, v) => s + (v || 0), 0)
  const free = income - allocated

  const save = () => {
    savePlan({ periodKey: pk, incomePlanned: income, categoryLimits: limits, goalContribution: 0 })
    for (const [id, value] of Object.entries(limits)) {
      updateCategory(id, { monthlyLimit: value || 0 })
    }
    haptic('success')
    onClose()
  }

  return (
    <Sheet title="Спланировать бюджет" onClose={onClose}>
      <Field label="Доход за период">
        <input type="number" inputMode="decimal" value={income} onChange={e => setIncome(Number(e.target.value))} />
      </Field>
      <div className="card-title" style={{ marginTop: 4 }}>Лимиты по категориям</div>
      {categories.filter(c => !c.isArchived).map(c => (
        <div className="field" key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>{c.emoji}</span>
          <span style={{ flex: 1 }}>{c.name}</span>
          <input type="number" inputMode="decimal" style={{ width: 110 }} value={limits[c.id] ?? 0} onChange={e => setLimits({ ...limits, [c.id]: Number(e.target.value) })} />
        </div>
      ))}
      <div className="card" style={{ background: 'color-mix(in srgb, var(--accent) 12%, #fff)' }}>
        <div className="row"><span className="muted">Распределено</span><span className="spacer" /><b>{formatMoney(allocated, user.currency)}</b></div>
        <div className="row" style={{ marginTop: 6 }}><span className="muted">Свободный остаток</span><span className="spacer" /><b style={{ color: free >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatMoney(free, user.currency)}</b></div>
      </div>
      <Button onClick={save}>Сохранить план</Button>
    </Sheet>
  )
}
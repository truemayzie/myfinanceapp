import { useMemo, useState } from 'react'
import { useStore, currentPeriodKey } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Icon } from '../components/icons'
import { useApp } from '../AppContext'
import { iconOf } from '../data/seed'

export default function BudgetPlan({ onClose }: { onClose: () => void }) {
  const { showToast } = useApp()
  const pk = currentPeriodKey()
  const categories = useStore(s => s.categories)
  const goals = useStore(s => s.goals)
  const plans = useStore(s => s.plans)
  const savePlan = useStore(s => s.savePlan)
  const plan = plans.find(p => p.periodKey === pk)

  const [income, setIncome] = useState(plan ? String(plan.incomePlanned) : '')
  const [limits, setLimits] = useState<Record<string, string>>(
    Object.fromEntries(categories.map(c => [c.id, String(plan?.categoryLimits?.[c.id] ?? c.monthlyLimit ?? '')])),
  )
  const [goalContrib, setGoalContrib] = useState(plan ? String(plan.goalContribution ?? '') : '')

  const totalLimits = useMemo(() => Object.values(limits).reduce((s, v) => s + (parseInt(v, 10) || 0), 0), [limits])

  const save = () => {
    const parsed = Object.fromEntries(
      categories.map(c => [c.id, Math.max(0, parseInt(limits[c.id] ?? '0', 10) || 0)]),
    )
    savePlan({
      periodKey: pk,
      incomePlanned: Math.max(0, parseInt(income, 10) || 0),
      categoryLimits: parsed,
      goalContribution: Math.max(0, parseInt(goalContrib, 10) || 0),
    })
    showToast('План сохранён')
    onClose()
  }

  return (
    <Sheet title="План на период" onClose={onClose}>
      <Field label="Планируемый доход (₽)">
        <input className="input" type="tel" inputMode="numeric" value={income} onChange={e => setIncome(e.target.value.replace(/[^\d]/g, ''))} />
      </Field>

      <div className="field">
        <label>Лимиты по категориям</label>
        <div className="list">
          {categories.map(c => (
            <div key={c.id} className="limit-row">
              <i className="sig" style={{ background: c.color }}><Icon name={iconOf(c) as any} size={15} /></i>
              <span className="row-main"><b>{c.name}</b></span>
              <input
                className="input num-input"
                type="tel"
                inputMode="numeric"
                value={limits[c.id] ?? ''}
                placeholder="—"
                onChange={e => setLimits({ ...limits, [c.id]: e.target.value.replace(/[^\d]/g, '') })}
              />
            </div>
          ))}
        </div>
        <small className="muted">Сумма лимитов: {totalLimits.toLocaleString('ru-RU')} ₽</small>
      </div>

      <Field label="Взнос из дохода в цель (₽/период)">
        <input className="input" type="tel" inputMode="numeric" value={goalContrib} onChange={e => setGoalContrib(e.target.value.replace(/[^\d]/g, ''))} />
      </Field>

      <Button block onClick={save}>Сохранить план</Button>
    </Sheet>
  )
}
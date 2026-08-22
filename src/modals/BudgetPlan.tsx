import { useMemo, useState } from 'react'
import { useStore, currentPeriodKey } from '../store/useStore'
import { formatMoney, monthLabel } from '../utils/finance'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { AmountInput, Field } from '../components/ui/Field'
import { Sign } from '../components/ui/Card'
import { useApp } from '../AppContext'
import { cn } from '../lib/cn'

export default function BudgetPlan({ onClose }: { onClose: () => void }) {
  const { showToast } = useApp()
  const pk = currentPeriodKey()
  const user = useStore(s => s.user)
  const categories = useStore(s => s.categories.filter(c => !c.isArchived))
  const plans = useStore(s => s.plans)
  const savePlan = useStore(s => s.savePlan)
  const plan = plans.find(p => p.periodKey === pk)
  const cur = user.currency

  const [income, setIncome] = useState(plan?.incomePlanned ? String(plan.incomePlanned) : '')
  const [limits, setLimits] = useState<Record<string, string>>(
    Object.fromEntries(
      categories.map(c => {
        const v = plan?.categoryLimits?.[c.id] ?? c.monthlyLimit
        return [c.id, v ? String(v) : '']
      }),
    ),
  )
  const [goalContrib, setGoalContrib] = useState(plan?.goalContribution ? String(plan.goalContribution) : '')

  const totalLimits = useMemo(
    () => Object.values(limits).reduce((s, v) => s + (parseInt(v, 10) || 0), 0),
    [limits],
  )
  const incomeValue = parseInt(income, 10) || 0
  const contribValue = parseInt(goalContrib, 10) || 0
  const rest = incomeValue - totalLimits - contribValue
  const exceeds = incomeValue > 0 && rest < 0

  const save = () => {
    savePlan({
      periodKey: pk,
      incomePlanned: Math.max(0, incomeValue),
      categoryLimits: {
        // лимиты архивных категорий не показываем, но и не теряем
        ...(plan?.categoryLimits ?? {}),
        ...Object.fromEntries(categories.map(c => [c.id, Math.max(0, parseInt(limits[c.id] ?? '0', 10) || 0)])),
      },
      goalContribution: Math.max(0, contribValue),
    })
    showToast('План сохранён')
    onClose()
  }

  return (
    <Sheet title="План на период" eyebrow={monthLabel(pk, user.periodStartDay)} onClose={onClose}>
      <Field label="Планируемый доход">
        <AmountInput
          currency={cur}
          value={income}
          onChange={e => setIncome(e.target.value.replace(/[^\d]/g, ''))}
        />
      </Field>

      <p className="eyebrow mb-2.5 mt-6">Лимиты по категориям</p>
      <div className="overflow-hidden rounded-card border border-line bg-card">
        {categories.map(c => (
          <div key={c.id} className="flex items-center gap-3 border-b border-line-soft px-3.5 py-2.5 last:border-b-0">
            <Sign cat={c} size={34} iconSize={15} />
            <b className="min-w-0 flex-1 truncate text-[13px] font-bold">{c.name}</b>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="—"
              value={limits[c.id] ?? ''}
              onChange={e => setLimits({ ...limits, [c.id]: e.target.value.replace(/[^\d]/g, '') })}
              className="num w-24 rounded-lg border border-line-input bg-surface px-3 py-2 text-right text-[13px] font-bold outline-none transition placeholder:text-pale focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 bg-surface-3 px-4 py-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">Сумма лимитов</span>
          <b className="num text-[13px] font-bold">{formatMoney(totalLimits, cur)}</b>
        </div>
      </div>

      <div className="mt-6">
        <Field label="Взнос в цели за период" hint="сколько откладываете из дохода">
          <AmountInput
            currency={cur}
            value={goalContrib}
            onChange={e => setGoalContrib(e.target.value.replace(/[^\d]/g, ''))}
          />
        </Field>
      </div>

      {incomeValue > 0 && (
        <p
          className={cn(
            'mt-1 rounded-tile px-4 py-3 text-[12px] font-semibold leading-5',
            exceeds ? 'bg-danger-soft text-danger' : 'bg-brand-pale text-brand-deep',
          )}
        >
          {exceeds
            ? `Лимиты и взносы превышают доход на ${formatMoney(-rest, cur)}.`
            : `Свободно после лимитов и взносов: ${formatMoney(rest, cur)}.`}
        </p>
      )}

      <Button block className="mt-6" onClick={save}>
        Сохранить план
      </Button>
    </Sheet>
  )
}

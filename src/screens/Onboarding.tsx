import { useState } from 'react'
import { ArrowRight, ChartPie, ShieldCheck, Target, WalletCards } from 'lucide-react'
import { useStore } from '../store/useStore'
import { getUserFromTelegram } from '../telegram'
import { periodKeyForDate } from '../utils/finance'
import { Button } from '../components/ui/Button'
import { AmountInput, Field, Input } from '../components/ui/Field'
import { Card } from '../components/ui/Card'

const PERKS = [
  { icon: ChartPie, title: 'Лимиты по категориям', text: 'Видно, где деньги уходят быстрее плана' },
  { icon: Target, title: 'Цели и копилки', text: 'Каждое пополнение — виден прогресс' },
  { icon: ShieldCheck, title: 'Данные в вашем Telegram', text: 'Синхронизация через бота, без сторонних аккаунтов' },
]

export default function Onboarding() {
  const categories = useStore(s => s.categories)
  const completeOnboarding = useStore(s => s.completeOnboarding)
  const savePlan = useStore(s => s.savePlan)
  const tgUser = getUserFromTelegram()
  const [name, setName] = useState(tgUser.name)
  const [currency, setCurrency] = useState('₽')
  const [periodStartDay, setPeriodStartDay] = useState(1)
  const [income, setIncome] = useState('')

  const start = () => {
    const day = Math.min(28, Math.max(1, periodStartDay || 1))
    completeOnboarding({ name: name.trim() || 'Друг', currency: currency.trim() || '₽', periodStartDay: day })
    const inc = parseInt(income, 10) || 0
    if (inc > 0) {
      savePlan({
        periodKey: periodKeyForDate(new Date(), day),
        incomePlanned: inc,
        categoryLimits: Object.fromEntries(categories.filter(c => !c.isArchived).map(c => [c.id, c.monthlyLimit])),
        goalContribution: 0,
      })
    }
  }

  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto grid max-w-[1040px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-14 lg:py-16">
        <div>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_6px_18px_rgba(29,122,98,0.24)]">
            <WalletCards className="size-6" strokeWidth={1.9} />
          </div>
          <h1 className="mt-6 text-[30px] font-bold leading-[1.1] tracking-[-0.055em] sm:text-[40px]">
            Финансы под контролем
          </h1>
          <p className="mt-3 max-w-[420px] text-sm leading-6 text-faint">
            Планируйте бюджет, ставьте цели и следите за тратами прямо в Telegram.
          </p>

          <div className="mt-8 space-y-4">
            {PERKS.map(p => {
              const Icon = p.icon
              return (
                <div key={p.title} className="flex items-start gap-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="size-[17px]" strokeWidth={1.9} />
                  </span>
                  <span>
                    <b className="block text-[13px] font-bold">{p.title}</b>
                    <small className="mt-0.5 block text-[11px] leading-4 text-dim">{p.text}</small>
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <Card className="p-6 sm:p-7">
          <p className="eyebrow">Шаг 1 из 1</p>
          <h2 className="mt-1.5 text-xl font-bold tracking-[-0.04em]">Настроим под вас</h2>

          <div className="mt-6">
            <Field label="Ваше имя">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Как к вам обращаться" />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="День начала периода" hint="дата зарплаты, 1–28">
                <Input
                  type="number"
                  min={1}
                  max={28}
                  value={periodStartDay}
                  onChange={e => setPeriodStartDay(Number(e.target.value))}
                />
              </Field>
              <Field label="Валюта">
                <Input value={currency} onChange={e => setCurrency(e.target.value)} />
              </Field>
            </div>

            <Field label="Ожидаемый доход за период" hint="можно пропустить и задать позже">
              <AmountInput
                currency={currency || '₽'}
                value={income}
                onChange={e => setIncome(e.target.value.replace(/[^\d]/g, ''))}
              />
            </Field>
          </div>

          <Button block className="mt-6" onClick={start}>
            Начать
            <ArrowRight className="size-4" strokeWidth={2.1} />
          </Button>
        </Card>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useStore } from '../store/useStore'
import { getUserFromTelegram } from '../telegram'
import { THEMES } from '../data/seed'
import { periodKeyForDate } from '../utils/finance'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Icon } from '../components/icons'
import type { ThemeName } from '../types'

export default function Onboarding() {
  const categories = useStore(s => s.categories)
  const completeOnboarding = useStore(s => s.completeOnboarding)
  const savePlan = useStore(s => s.savePlan)
  const tgUser = getUserFromTelegram()
  const [name, setName] = useState(tgUser.name)
  const [currency, setCurrency] = useState('₽')
  const [periodStartDay, setPeriodStartDay] = useState(1)
  const [income, setIncome] = useState('')
  const [theme, setTheme] = useState<ThemeName>('lavender')

  const themes = Object.entries(THEMES) as [keyof typeof THEMES, (typeof THEMES)[keyof typeof THEMES]][]

  const start = () => {
    const day = Math.min(28, Math.max(1, periodStartDay || 1))
    completeOnboarding({ name: name.trim() || 'Друг', currency: currency.trim() || '₽', periodStartDay: day, theme })
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
    <div className="content onboarding">
      <div className="ob-hero">
        <div className="ob-mark"><Icon name="wallet" size={44} /></div>
        <h1>Финансы под контролем</h1>
        <p>Ставьте цели, планируйте бюджет и следите за тратами прямо в Telegram.</p>
      </div>

      <div className="panel">
        <Field label="Ваше имя">
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </Field>
        <Field label="Валюта">
          <input className="input" value={currency} onChange={e => setCurrency(e.target.value)} />
        </Field>
        <Field label="День начала месяца (дата зарплаты)">
          <input className="input" type="number" min={1} max={28} value={periodStartDay} onChange={e => setPeriodStartDay(Number(e.target.value))} />
        </Field>
        <Field label="Ожидаемый доход за период (₽)">
          <input className="input" type="tel" inputMode="numeric" value={income} onChange={e => setIncome(e.target.value.replace(/[^\d]/g, ''))} placeholder="0" />
        </Field>
      </div>

      <Field label="Акцент">
        <div className="theme-grid">
          {themes.map(([key, t]) => (
            <button
              key={key}
              className={`theme-swatch ${theme === key ? 'on' : ''}`}
              style={{ background: t.primary }}
              onClick={() => setTheme(key)}
              title={t.label}
            />
          ))}
        </div>
      </Field>

      <Button block onClick={start}>Начать</Button>
    </div>
  )
}
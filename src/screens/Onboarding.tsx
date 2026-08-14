import { useState } from 'react'
import { useStore } from '../store/useStore'
import { getUserFromTelegram } from '../telegram'
import { THEMES } from '../data/seed'
import { periodKeyForDate } from '../utils/finance'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import type { ThemeName } from '../types'

export default function Onboarding() {
  const { categories, completeOnboarding, savePlan } = useStore()
  const tgUser = getUserFromTelegram()
  const [name, setName] = useState(tgUser.name)
  const [currency, setCurrency] = useState('₽')
  const [periodStartDay, setPeriodStartDay] = useState(1)
  const [income, setIncome] = useState(0)
  const [theme, setTheme] = useState<ThemeName>('lavender')

  const themes = Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES[keyof typeof THEMES]][]

  const start = () => {
    const day = Math.min(28, Math.max(1, periodStartDay || 1))
    completeOnboarding({ name: name.trim() || 'Друг', currency: currency.trim() || '₽', periodStartDay: day, theme })
    if (income > 0) {
      savePlan({
        periodKey: periodKeyForDate(new Date(), day),
        incomePlanned: income,
        categoryLimits: Object.fromEntries(categories.filter(c => !c.isArchived).map(c => [c.id, c.monthlyLimit])),
        goalContribution: 0,
      })
    }
  }

  return (
    <div className="content" style={{ paddingTop: 40 }}>
      <div className="center" style={{ paddingTop: 10 }}>
        <div style={{ fontSize: 56 }}>💰</div>
        <h1 style={{ fontSize: 26, margin: '10px 0' }}>Финансы под контролем</h1>
        <p className="muted">Ставьте цели, планируйте бюджет и следите за тратами прямо в Telegram.</p>
      </div>

      <div className="card">
        <Field label="Ваше имя"><input value={name} onChange={e => setName(e.target.value)} /></Field>
        <Field label="Валюта"><input value={currency} onChange={e => setCurrency(e.target.value)} /></Field>
        <Field label="День начала месяца (дата зарплаты)">
          <input type="number" min={1} max={28} value={periodStartDay} onChange={e => setPeriodStartDay(Number(e.target.value))} />
        </Field>
        <Field label="Ожидаемый доход за период">
          <input type="number" inputMode="decimal" value={income} onChange={e => setIncome(Number(e.target.value))} placeholder="0" />
        </Field>
        <Field label="Тема">
          <div className="theme-grid">
            {themes.map(([key, t]) => (
              <div
                key={key}
                className={`theme-swatch ${theme === key ? 'on' : ''}`}
                style={{ background: t.accent }}
                onClick={() => setTheme(key)}
                title={t.label}
              />
            ))}
          </div>
        </Field>
      </div>

      <Button onClick={start}>Начать</Button>
    </div>
  )
}
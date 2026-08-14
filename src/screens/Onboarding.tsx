import { useState } from 'react'
import { useStore } from '../store/useStore'
import { getUserFromTelegram } from '../telegram'
import { THEMES } from '../data/seed'

export default function Onboarding() {
  const complete = useStore(s => s.completeOnboarding)
  const tgUser = getUserFromTelegram()
  const [name, setName] = useState(tgUser.name)
  const [currency, setCurrency] = useState('₽')
  const [periodStartDay, setPeriodStartDay] = useState(1)
  const [income, setIncome] = useState(0)

  const themes = Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES[keyof typeof THEMES]][]

  const start = () => {
    complete({ name: name || 'Друг', currency, periodStartDay: Math.min(28, Math.max(1, periodStartDay)), theme: 'lavender' })
  }

  return (
    <div className="content" style={{ paddingTop: 40 }}>
      <div className="center" style={{ paddingTop: 10 }}>
        <div style={{ fontSize: 56 }}>💰</div>
        <h1 style={{ fontSize: 26, margin: '10px 0' }}>Финансы под контролем</h1>
        <p className="muted">Ставьте цели, планируйте бюджет и следите за тратами прямо в Telegram.</p>
      </div>

      <div className="card">
        <div className="field"><label>Ваше имя</label><input value={name} onChange={e => setName(e.target.value)} /></div>
        <div className="field"><label>Валюта</label><input value={currency} onChange={e => setCurrency(e.target.value)} /></div>
        <div className="field"><label>День начала месяца (дата зарплаты)</label>
          <input type="number" min={1} max={28} value={periodStartDay} onChange={e => setPeriodStartDay(Number(e.target.value))} />
        </div>
        <div className="field"><label>Ожидаемый доход за период</label>
          <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} />
        </div>
        <div className="field"><label>Тема</label>
          <div className="theme-grid">
            {themes.map(([key, t]) => (
              <div key={key} className="theme-swatch" style={{ background: t.accent, borderColor: 'var(--track)' }} />
            ))}
          </div>
        </div>
      </div>

      <button className="primary-btn" onClick={start}>Начать</button>
    </div>
  )
}

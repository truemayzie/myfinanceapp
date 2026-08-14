import { useState } from 'react'
import { useStore, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import { THEMES } from '../data/seed'
import { exportCSV } from '../utils/export'
import { AppHeader, Section } from '../components/ui/AppHeader'
import { Icon } from '../components/icons'
import { Button } from '../components/ui/Button'

export default function Settings() {
  const user = useStore(s => s.user)
  const updateUser = useStore(s => s.updateUser)
  const operations = useStore(s => s.operations)
  const categories = useStore(s => s.categories)
  const goals = useStore(s => s.goals)
  const resetPeriod = useStore(s => s.resetPeriod)
  const { openSheet, showToast } = useApp()
  const [name, setName] = useState(user.name)

  const themes = Object.entries(THEMES) as [keyof typeof THEMES, (typeof THEMES)[keyof typeof THEMES]][]

  const resetMonth = () => {
    if (confirm('Обнулить траты текущего периода? Операции останутся в истории, но перестанут влиять на бюджет.')) {
      resetPeriod(currentPeriodKey())
      showToast('Период обнулён')
    }
  }

  return (
    <div>
      <AppHeader title="Настройки" subtitle={`Привет, ${user.name}`} />

      <Section title="Профиль" />
      <div className="panel">
        <div className="field">
          <label>Имя</label>
          <input
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => updateUser({ name: name.trim() || 'Друг' })}
          />
        </div>
        <div className="field">
          <label>Начало периода (день зарплаты)</label>
          <input
            className="input"
            type="number" min={1} max={28}
            defaultValue={user.periodStartDay}
            onBlur={e => updateUser({ periodStartDay: Math.min(28, Math.max(1, Number(e.target.value) || 1)) })}
          />
        </div>
        <div className="field">
          <label>Валюта</label>
          <input
            className="input"
            defaultValue={user.currency}
            onBlur={e => updateUser({ currency: e.target.value.trim() || '₽' })}
          />
        </div>
      </div>

      <Section title="Акцент" />
      <div className="panel">
        <div className="theme-grid">
          {themes.map(([key, t]) => (
            <button
              key={key}
              className={`theme-swatch ${user.theme === key ? 'on' : ''}`}
              style={{ background: t.primary }}
              onClick={() => updateUser({ theme: key })}
              title={t.label}
            />
          ))}
        </div>
      </div>

      <Section title="Данные" />
      <div className="list">
        <button className="nav-row" onClick={() => openSheet('categories')}>
          <Icon name="tag" size={18} /><span className="row-main"><b>Категории</b><small>{categories.length}</small></span>
          <Icon name="chevR" size={18} className="muted" />
        </button>
        <button className="nav-row" onClick={() => openSheet('tbank')}>
          <Icon name="phone" size={18} /><span className="row-main"><b>Импорт из Т-Банка</b><small>пуши бота</small></span>
          <Icon name="chevR" size={18} className="muted" />
        </button>
        <button className="nav-row" onClick={() => openSheet('history')}>
          <Icon name="history" size={18} /><span className="row-main"><b>История операций</b><small>{operations.length}</small></span>
          <Icon name="chevR" size={18} className="muted" />
        </button>
        <button
          className="nav-row"
          onClick={() => {
            if (operations.length === 0) return showToast('Нет операций для экспорта')
            exportCSV(operations, categories, goals)
            showToast('CSV скачан')
          }}
        >
          <Icon name="download" size={18} /><span className="row-main"><b>Экспорт CSV</b><small>{operations.length} операций</small></span>
          <Icon name="chevR" size={18} className="muted" />
        </button>
      </div>

      <Section title="Подписка" />
      <div className="upgrade">
        <h3>Финансы PRO</h3>
        <p>Неограниченные категории, цели без лимита и приоритетная поддержка.</p>
        <Button onClick={() => showToast('Подписка — в разработке')}>Выбрать план</Button>
      </div>

      <div className="row-actions">
        <button className="link-btn danger" onClick={resetMonth}>Обнулить период</button>
      </div>
      <p className="footnote">Всего операций: {operations.length} · данные хранятся локально и в облаке</p>

      <div className="pad">
        <Button variant="ghost" block onClick={() => openSheet('support')}>Поддержка</Button>
      </div>
    </div>
  )
}
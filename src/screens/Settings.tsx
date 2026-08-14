import { useState } from 'react'
import { useStore, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import { THEMES } from '../data/seed'
import { TopBar } from '../components/ui/TopBar'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'

export default function Settings() {
  const { user, updateUser, operations, sendSupport, resetPeriod } = useStore()
  const { openSheet, showToast } = useApp()
  const [supportText, setSupportText] = useState('')
  const themes = Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES[keyof typeof THEMES]][]

  const resetMonth = () => {
    if (confirm('Обнулить траты текущего месяца? Операции останутся в истории, но перестанут влиять на бюджет.')) {
      resetPeriod(currentPeriodKey())
      showToast('Месяц обнулён')
    }
  }

  const send = () => {
    if (!supportText.trim()) return
    sendSupport(supportText.trim())
    setSupportText('')
    showToast('Отправлено в поддержку')
  }

  return (
    <div>
      <TopBar title="Настройки" />

      <div className="card">
        <div className="card-title">Подписка</div>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Бесплатно: до 10 категорий и 3 целей. PRO — безлимит и экспорт.</p>
        <Button onClick={() => showToast('Подписка — в разработке')}>Выбрать план</Button>
      </div>

      <div className="card">
        <div className="card-title">Поддержка</div>
        <Field label="Сообщение">
          <textarea value={supportText} onChange={e => setSupportText(e.target.value)} placeholder="Опишите проблему..." style={{ minHeight: 70, resize: 'vertical' }} />
        </Field>
        <Button onClick={send}>Написать в поддержку</Button>
      </div>

      <div className="card">
        <div className="card-title">Тема</div>
        <div className="theme-grid">
          {themes.map(([key, t]) => (
            <div
              key={key}
              className={`theme-swatch ${user.theme === key ? 'on' : ''}`}
              style={{ background: t.accent }}
              onClick={() => updateUser({ theme: key })}
              title={t.label}
            />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Импорт из Т-Банка</div>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Перешлите пуш о списании боту — трата добавится автоматически.</p>
        <Button variant="ghost" onClick={() => openSheet('tbank')}>Добавить из пуша</Button>
      </div>

      <div className="card">
        <div className="card-title">Профиль</div>
        <Field label="Имя">
          <input defaultValue={user.name} onBlur={e => updateUser({ name: e.target.value.trim() || 'Друг' })} />
        </Field>
        <Field label="День начала месяца (дата зарплаты)">
          <input type="number" min={1} max={28} defaultValue={user.periodStartDay} onBlur={e => updateUser({ periodStartDay: Math.min(28, Math.max(1, Number(e.target.value) || 1)) })} />
        </Field>
        <Field label="Валюта">
          <input defaultValue={user.currency} onBlur={e => updateUser({ currency: e.target.value.trim() || '₽' })} />
        </Field>
      </div>

      <Button variant="danger" onClick={resetMonth}>Обнулить траты за месяц</Button>
      <p className="muted center" style={{ fontSize: 12 }}>Всего операций: {operations.length}</p>
    </div>
  )
}
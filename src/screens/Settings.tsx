import { useStore } from '../store/useStore'
import { useApp } from '../AppContext'
import { THEMES } from '../data/seed'
import { formatMoney } from '../utils/finance'

export default function Settings() {
  const { user, updateUser, operations, sendSupport } = useStore()
  const { openSheet, showToast } = useApp()
  const themes = Object.entries(THEMES) as [keyof typeof THEMES, typeof THEMES[keyof typeof THEMES]][]

  const resetMonth = () => {
    if (confirm('Обнулить траты за месяц? Операции сохранятся в истории.')) {
      showToast('Месяц сброшен (демо)')
    }
  }

  return (
    <div>
      <div className="topbar"><h1>Настройки</h1></div>

      <div className="card">
        <div className="card-title">Подписка</div>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Бесплатно: до 10 категорий и 3 целей. PRO — безлимит и экспорт.</p>
        <button className="primary-btn" onClick={() => showToast('Подписка — в разработке')}>Выбрать план</button>
      </div>

      <div className="card">
        <div className="card-title">Поддержка</div>
        <textarea id="support" className="field" style={{ width: '100%', border: '1px solid var(--track)', borderRadius: 14, padding: 12, minHeight: 70 }} placeholder="Опишите проблему..." />
        <button className="primary-btn" onClick={() => {
          const el = document.getElementById('support') as HTMLTextAreaElement
          if (el.value.trim()) { sendSupport(el.value.trim()); el.value = ''; showToast('Отправлено в поддержку') }
        }}>Написать в поддержку</button>
      </div>

      <div className="card">
        <div className="card-title">Тема</div>
        <div className="theme-grid">
          {themes.map(([key, t]) => (
            <div key={key} className={`theme-swatch ${user.theme === key ? 'on' : ''}`} style={{ background: t.accent }} onClick={() => updateUser({ theme: key })} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Импорт из Т-Банка</div>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>Перешлите пуш о списании боту — трата добавится автоматически.</p>
        <button className="ghost-btn" onClick={() => openSheet('tbank')}>Добавить из пуша</button>
      </div>

      <div className="card">
        <div className="card-title">Профиль</div>
        <div className="field">
          <label>Имя</label>
          <input defaultValue={user.name} onBlur={e => updateUser({ name: e.target.value || 'Друг' })} />
        </div>
        <div className="field">
          <label>День начала месяца (дата зарплаты)</label>
          <input type="number" min={1} max={28} defaultValue={user.periodStartDay} onBlur={e => updateUser({ periodStartDay: Math.min(28, Math.max(1, Number(e.target.value) || 1)) })} />
        </div>
        <div className="field">
          <label>Валюта</label>
          <input defaultValue={user.currency} onBlur={e => updateUser({ currency: e.target.value || '₽' })} />
        </div>
      </div>

      <button className="danger-btn" onClick={resetMonth}>Обнулить траты за месяц</button>
      <p className="muted center" style={{ fontSize: 12 }}>Всего операций: {operations.length}</p>
    </div>
  )
}

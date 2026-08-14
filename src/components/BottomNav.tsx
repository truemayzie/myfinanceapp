import { Icon, IconName } from './icons'

const TABS: { id: string; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Главная', icon: 'home' },
  { id: 'stats', label: 'Статистика', icon: 'pie' },
  { id: 'goals', label: 'Цели', icon: 'target' },
  { id: 'analytics', label: 'Аналитика', icon: 'bars' },
  { id: 'settings', label: 'Настройки', icon: 'gear' },
]

export default function BottomNav({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <nav className="tab-bar">
      {TABS.map(t => (
        <button key={t.id} className={`tab-btn ${active === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          <Icon name={t.icon} size={22} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
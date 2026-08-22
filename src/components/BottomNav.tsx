import { Home, PieChart, Settings, Target, type LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'

export const TABS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'home', label: 'Главная', icon: Home },
  { id: 'stats', label: 'Статистика', icon: PieChart },
  { id: 'goals', label: 'Цели', icon: Target },
  { id: 'settings', label: 'Настройки', icon: Settings },
]

/** Нижнее меню — основной способ навигации внутри Telegram */
export default function BottomNav({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[72px] items-center justify-around border-t border-line bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      {TABS.map(t => {
        const on = active === t.id
        const Icon = t.icon
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'flex min-w-[64px] flex-col items-center gap-1.5 text-[10px] font-bold transition',
              on ? 'text-brand' : 'text-dim',
            )}
          >
            <Icon className="size-[19px]" strokeWidth={on ? 2.3 : 1.8} />
            {t.label}
          </button>
        )
      })}
    </nav>
  )
}

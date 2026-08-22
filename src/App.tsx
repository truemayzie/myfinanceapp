import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CircleHelp, History as HistoryIcon, WalletCards } from 'lucide-react'
import { useStore, SYNC_ENABLED } from './store/useStore'
import { initSync } from './lib/sync'
import { seedMock } from './dev/mock'
import { AppContext, SheetKind } from './AppContext'
import BottomNav, { TABS } from './components/BottomNav'
import Fab from './components/Fab'
import { cn } from './lib/cn'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Stats from './screens/Stats'
import Goals from './screens/Goals'
import Settings from './screens/Settings'
import AddOperation from './modals/AddOperation'
import QuickAdd from './modals/QuickAdd'
import BudgetPlan from './modals/BudgetPlan'
import GoalEdit from './modals/GoalEdit'
import GoalContribute from './modals/GoalContribute'
import CategoryEdit from './modals/CategoryEdit'
import CategoryManager from './modals/CategoryManager'
import History from './modals/History'
import TbankImport from './modals/TbankImport'
import SupportSheet from './modals/SupportSheet'

let mockSeeded = false

export default function App() {
  const user = useStore(s => s.user)
  const hydrated = useStore(s => s.hydrated)
  const syncMode = useStore(s => s.syncMode)
  const onboarded = useStore(s => s.user.onboarded)
  const [tab, setTab] = useState('home')
  const [sheet, setSheet] = useState<SheetKind>(null)
  const [sheetPayload, setSheetPayload] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    initSync()
  }, [])

  useEffect(() => {
    if (!hydrated || !onboarded || mockSeeded) return
    const param = new URLSearchParams(window.location.search).get('mock')
    if (param === 'normal' || param === 'over' || param === 'empty') {
      mockSeeded = true
      const n = seedMock(param)
      if (n > 0) setSheet('history')
    }
  }, [hydrated, onboarded])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  const openSheet = (k: SheetKind, payload?: any) => {
    setSheetPayload(payload ?? null)
    setSheet(k)
  }

  const ctx = useMemo(() => ({ openSheet, showToast, goTab: setTab }), [])
  const closeSheet = () => setSheet(null)

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper text-ink">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-brand text-white shadow-[0_5px_14px_rgba(29,122,98,0.2)]">
          <WalletCards className="size-6" />
        </div>
        <p className="text-xs font-semibold text-dim">Загрузка…</p>
      </div>
    )
  }

  if (!user.onboarded) {
    return (
      <AppContext.Provider value={ctx}>
        <Onboarding />
      </AppContext.Provider>
    )
  }

  const cloud = SYNC_ENABLED && syncMode === 'cloud'

  return (
    <AppContext.Provider value={ctx}>
      <div className="min-h-dvh bg-paper text-ink">
        <div className="mx-auto flex min-h-dvh max-w-[1440px]">
          {/* Сайдбар — только на широких экранах, в Telegram не показывается */}
          <aside className="hidden w-[244px] shrink-0 flex-col border-r border-line bg-surface px-5 py-7 lg:flex">
            <div className="flex items-center gap-3 px-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-brand text-white shadow-[0_5px_14px_rgba(29,122,98,0.2)]">
                <WalletCards className="size-[18px]" />
              </div>
              <span className="text-[17px] font-bold tracking-[-0.04em]">Финансы</span>
            </div>

            <div className="mt-14 flex flex-1 flex-col">
              <p className="eyebrow mb-3 px-3">Рабочее пространство</p>
              <nav className="space-y-1">
                {TABS.map(t => {
                  const on = tab === t.id
                  const Icon = t.icon
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[13px] font-semibold transition-all',
                        on ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface-2 hover:text-ink',
                      )}
                    >
                      <Icon className="size-[17px]" strokeWidth={on ? 2.4 : 1.8} />
                      {t.label}
                    </button>
                  )
                })}
              </nav>

              <div className="mt-auto rounded-card bg-surface-2 p-4">
                <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-card text-brand">
                  <CircleHelp className="size-4" />
                </div>
                <p className="text-xs font-bold">Нужна помощь?</p>
                <p className="mt-1 text-[11px] leading-4 text-faint">
                  Напишите нам — разберёмся с любым вопросом по учёту.
                </p>
                <button onClick={() => openSheet('support')} className="mt-3 text-[11px] font-bold text-brand">
                  Написать в поддержку →
                </button>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 pb-24 lg:pb-10">
            <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-3 border-b border-line bg-surface/85 px-5 backdrop-blur sm:h-[76px] sm:px-8 lg:px-11">
              <div className="flex items-center gap-2.5 lg:hidden">
                <div className="flex size-8 items-center justify-center rounded-lg bg-brand text-white">
                  <WalletCards className="size-4" />
                </div>
                <span className="text-sm font-bold tracking-[-0.03em]">Финансы</span>
              </div>

              <div className="hidden items-center gap-2 text-xs font-medium text-faint lg:flex">
                <span className={cn('size-2 rounded-full', cloud ? 'bg-brand-mint' : 'bg-warn')} />
                {cloud ? 'Данные синхронизированы' : 'Только это устройство'}
              </div>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => openSheet('history')}
                  aria-label="История"
                  className="flex size-9 items-center justify-center rounded-full border border-line bg-card text-muted transition hover:border-[#c9c6bd] hover:text-ink"
                >
                  <HistoryIcon className="size-[17px]" strokeWidth={1.8} />
                </button>
                <div className="hidden h-7 w-px bg-line sm:block" />
                <div className="flex size-9 items-center justify-center rounded-full bg-brand-sage text-xs font-bold text-brand-deep">
                  {(user.name || 'Д').slice(0, 1).toUpperCase()}
                </div>
                <span className="hidden max-w-[120px] truncate text-xs font-bold sm:block">{user.name}</span>
              </div>
            </header>

            <div className="mx-auto max-w-[1130px] px-5 py-7 sm:px-8 lg:px-11 lg:py-10">
              {tab === 'home' && <Home />}
              {tab === 'stats' && <Stats />}
              {tab === 'goals' && <Goals />}
              {tab === 'settings' && <Settings />}
            </div>
          </main>
        </div>

        {tab === 'home' && <Fab onClick={() => openSheet('quickAdd')} />}
        <BottomNav active={tab} onChange={setTab} />

        <AnimatePresence>
          {sheet === 'add' && <AddOperation onClose={closeSheet} />}
          {sheet === 'quickAdd' && <QuickAdd onClose={closeSheet} />}
          {sheet === 'budget' && <BudgetPlan onClose={closeSheet} />}
          {sheet === 'goal' && <GoalEdit onClose={closeSheet} editId={sheetPayload?.id} />}
          {sheet === 'goalContribute' && <GoalContribute onClose={closeSheet} goalId={sheetPayload?.id} />}
          {sheet === 'category' && <CategoryEdit onClose={closeSheet} editId={sheetPayload?.id} />}
          {sheet === 'categories' && <CategoryManager onClose={closeSheet} />}
          {sheet === 'history' && <History onClose={closeSheet} />}
          {sheet === 'tbank' && <TbankImport onClose={closeSheet} />}
          {sheet === 'support' && <SupportSheet onClose={closeSheet} />}

          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              className="fixed bottom-[calc(96px+env(safe-area-inset-bottom))] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white shadow-xl lg:bottom-8"
            >
              <Check className="size-4 text-brand-mint" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppContext.Provider>
  )
}

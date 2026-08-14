import { useEffect, useMemo, useState } from 'react'
import { useStore } from './store/useStore'
import { initSync } from './lib/sync'
import { THEMES } from './data/seed'
import { seedMock } from './dev/mock'
import { AppContext, SheetKind } from './AppContext'
import BottomNav from './components/BottomNav'
import Fab from './components/Fab'
import { Icon } from './components/icons'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Stats from './screens/Stats'
import Goals from './screens/Goals'
import Analytics from './screens/Analytics'
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

/** primary -> rgba(..., a) */
function hexA(hex: string, a: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return hex
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

let mockSeeded = false

export default function App() {
  const user = useStore(s => s.user)
  const hydrated = useStore(s => s.hydrated)
  const onboarded = useStore(s => s.user.onboarded)
  const [tab, setTab] = useState('home')
  const [sheet, setSheet] = useState<SheetKind>(null)
  const [sheetPayload, setSheetPayload] = useState<any>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    initSync()
  }, [])

  useEffect(() => {
    const t = THEMES[user.theme]
    const root = document.documentElement
    root.style.setProperty('--primary', t.primary)
    root.style.setProperty('--primary-2', t.primary2)
    root.style.setProperty('--primary-soft', hexA(t.primary, 0.1))
    root.style.setProperty('--primary-xsoft', hexA(t.primary, 0.06))
  }, [user.theme])

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
    setTimeout(() => setToast(null), 1800)
  }

  const openSheet = (k: SheetKind, payload?: any) => {
    setSheetPayload(payload ?? null)
    setSheet(k)
  }

  const ctx = useMemo(() => ({ openSheet, showToast, goTab: setTab }), [])

  if (!hydrated) {
    return (
      <div className="splash">
        <Icon name="wallet" size={44} />
        <p>Загрузка…</p>
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

  return (
    <AppContext.Provider value={ctx}>
      <div className="app">
        <div className="content">
          {tab === 'home' && <Home />}
          {tab === 'stats' && <Stats />}
          {tab === 'goals' && <Goals />}
          {tab === 'analytics' && <Analytics />}
          {tab === 'settings' && <Settings />}
        </div>

        {tab === 'home' && <Fab onClick={() => openSheet('quickAdd')} />}
        <BottomNav active={tab} onChange={setTab} />

        {sheet === 'add' && <AddOperation onClose={() => setSheet(null)} />}
        {sheet === 'quickAdd' && <QuickAdd onClose={() => setSheet(null)} />}
        {sheet === 'budget' && <BudgetPlan onClose={() => setSheet(null)} />}
        {sheet === 'goal' && <GoalEdit onClose={() => setSheet(null)} editId={sheetPayload?.id} />}
        {sheet === 'goalContribute' && <GoalContribute onClose={() => setSheet(null)} goalId={sheetPayload?.id} />}
        {sheet === 'category' && <CategoryEdit onClose={() => setSheet(null)} editId={sheetPayload?.id} />}
        {sheet === 'categories' && <CategoryManager onClose={() => setSheet(null)} />}
        {sheet === 'history' && <History onClose={() => setSheet(null)} />}
        {sheet === 'tbank' && <TbankImport onClose={() => setSheet(null)} />}
        {sheet === 'support' && <SupportSheet onClose={() => setSheet(null)} />}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </AppContext.Provider>
  )
}
import { useEffect, useMemo, useState } from 'react'
import { useStore } from './store/useStore'
import { initSync } from './lib/sync'
import { THEMES } from './data/seed'
import { AppContext, SheetKind } from './AppContext'
import BottomNav from './components/BottomNav'
import Fab from './components/Fab'
import Onboarding from './screens/Onboarding'
import Home from './screens/Home'
import Stats from './screens/Stats'
import Goals from './screens/Goals'
import Analytics from './screens/Analytics'
import Settings from './screens/Settings'
import AddOperation from './modals/AddOperation'
import BudgetPlan from './modals/BudgetPlan'
import GoalEdit from './modals/GoalEdit'
import GoalContribute from './modals/GoalContribute'
import CategoryEdit from './modals/CategoryEdit'
import TbankImport from './modals/TbankImport'

export default function App() {
  const user = useStore(s => s.user)
  const hydrated = useStore(s => s.hydrated)
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
    root.style.setProperty('--bg', t.bg)
    root.style.setProperty('--accent', t.accent)
    root.style.setProperty('--accent2', t.accent2)
  }, [user.theme])

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
    return <div className="center" style={{ paddingTop: 80 }}><div style={{ fontSize: 40 }}>💰</div><p className="muted">Загрузка…</p></div>
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

        {tab === 'home' && <Fab onClick={() => openSheet('add')} />}
        <BottomNav active={tab} onChange={setTab} />

        {sheet === 'add' && <AddOperation onClose={() => setSheet(null)} />}
        {sheet === 'budget' && <BudgetPlan onClose={() => setSheet(null)} />}
        {sheet === 'goal' && <GoalEdit onClose={() => setSheet(null)} editId={sheetPayload?.id} />}
        {sheet === 'goalContribute' && <GoalContribute onClose={() => setSheet(null)} goalId={sheetPayload?.id} />}
        {sheet === 'category' && <CategoryEdit onClose={() => setSheet(null)} editId={sheetPayload?.id} />}
        {sheet === 'tbank' && <TbankImport onClose={() => setSheet(null)} />}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </AppContext.Provider>
  )
}

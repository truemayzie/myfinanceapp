import { useStore, SYNC_ENABLED } from '../store/useStore'
import { getInitData } from '../telegram'
import { getState, saveState } from './api'

function tidFromInit(initData: string): number | null {
  try {
    const p = new URLSearchParams(initData)
    const u = JSON.parse(p.get('user') || '{}')
    return u.id ?? null
  } catch {
    return null
  }
}

let timer: any = null

function pickState(s: any) {
  return {
    user: s.user,
    categories: s.categories,
    operations: s.operations,
    goals: s.goals,
    plans: s.plans,
    tickets: s.tickets,
  }
}

export async function initSync() {
  if (!SYNC_ENABLED) {
    useStore.getState().setHydrated(true)
    return
  }
  const initData = getInitData()
  if (!initData) {
    // Запущено вне Telegram — работаем локально.
    useStore.getState().setHydrated(true)
    return
  }

  const res = await getState(initData)
  if (res?.state) {
    const tid = tidFromInit(initData)
    useStore.getState()._replace({
      ...res.state,
      user: { ...res.state.user, telegramId: tid },
    })
  }
  useStore.getState().setHydrated(true)

  useStore.subscribe((s) => {
    if (!s.hydrated) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      const d = getInitData()
      if (d) saveState(d, pickState(s))
    }, 800)
  })
}

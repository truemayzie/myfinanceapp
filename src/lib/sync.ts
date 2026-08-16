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

let timer: ReturnType<typeof setTimeout> | null = null
let started = false

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
  if (started) return // StrictMode в dev вызывает эффекты дважды
  started = true

  if (!SYNC_ENABLED) {
    useStore.getState().setHydrated(true)
    useStore.getState().setSyncMode('local')
    return
  }
  const initData = getInitData()
  if (!initData) {
    // Запущено вне Telegram — работаем локально.
    useStore.getState().setHydrated(true)
    useStore.getState().setSyncMode('local')
    return
  }

  useStore.getState().setSyncMode('cloud')
  const res = await getState(initData)
  const local = useStore.getState()

  if (res?.state) {
    const serverOps = res.state.operations?.length ?? 0
    const localOps = local.operations.length
    if (localOps > serverOps && localOps > 0) {
      // На этом устройстве данных больше — облако не должно их затирать.
      // Публикуем локальное состояние как самое полное.
      await saveState(initData, pickState(local))
    } else {
      const tid = tidFromInit(initData)
      local._replace({
        ...res.state,
        user: { ...res.state.user, telegramId: tid },
      })
    }
  } else if (local.operations.length > 0 || local.plans.length > 0 || local.user.onboarded) {
    // В облаке пусто, но на этом устройстве есть данные — заливаем их.
    await saveState(initData, pickState(local))
  }
  useStore.getState().setHydrated(true)

  useStore.subscribe((s) => {
    if (!s.hydrated) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      const d = getInitData()
      if (d) saveState(d, pickState(s))
    }, 800)
  })
}
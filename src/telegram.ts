import WebApp from '@twa-dev/sdk'

export const tg = WebApp

export function initTelegram() {
  try {
    tg.ready()
    tg.expand()
    tg.setHeaderColor?.('#fbfaf7')
    tg.setBackgroundColor?.('#f6f5f1')
  } catch {
    /* outside telegram — ignore */
  }
}

export function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  try {
    if (type === 'success' || type === 'error') {
      tg.HapticFeedback?.notificationOccurred(type)
    } else {
      tg.HapticFeedback?.impactOccurred(type)
    }
  } catch {
    /* ignore */
  }
}

export function getUserFromTelegram(): { telegramId: number | null; name: string } {
  try {
    const u = tg.initDataUnsafe?.user
    if (u) return { telegramId: u.id, name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || 'Друг' }
  } catch {
    /* ignore */
  }
  return { telegramId: null, name: 'Друг' }
}

export function getInitData(): string {
  try {
    return tg.initData || ''
  } catch {
    return ''
  }
}

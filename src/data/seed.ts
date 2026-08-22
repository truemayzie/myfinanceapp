import type { Category } from '../types'

export const CATEGORY_ICONS = ['cart', 'cup', 'train', 'house', 'balloon', 'health', 'tag', 'hanger', 'bulb', 'phone', 'burger', 'coins'] as const

export const GOAL_EMOJIS = ['🎯', '🚗', '🏠', '✈️', '💻', '📱', '💍', '🎓', '🎮', '🐱', '🏖️', '🛡️']

/** Палитра категорий — насыщенные цвета, пастель для фона считается через tint() */
export const CATEGORY_COLORS = [
  '#1b7f67', '#b45d41', '#4c71b8', '#8559b7',
  '#bb7a19', '#278a9c', '#77776f', '#a4553f',
]

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Продукты', icon: 'cart', color: '#1b7f67', monthlyLimit: 15000, sortOrder: 0, isArchived: false },
  { name: 'Кафе и рестораны', icon: 'cup', color: '#b45d41', monthlyLimit: 5000, sortOrder: 1, isArchived: false },
  { name: 'Транспорт', icon: 'train', color: '#4c71b8', monthlyLimit: 3000, sortOrder: 2, isArchived: false },
  { name: 'Жильё', icon: 'house', color: '#8559b7', monthlyLimit: 25000, sortOrder: 3, isArchived: false },
  { name: 'Развлечения', icon: 'balloon', color: '#bb7a19', monthlyLimit: 4000, sortOrder: 4, isArchived: false },
  { name: 'Здоровье', icon: 'health', color: '#278a9c', monthlyLimit: 3000, sortOrder: 5, isArchived: false },
  { name: 'Прочее', icon: 'tag', color: '#77776f', monthlyLimit: 0, sortOrder: 6, isArchived: false },
]

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

/** Иконка категории с фолбэком для старых данных */
export function iconOf(cat: Pick<Category, 'icon'>): string {
  return cat.icon ?? 'tag'
}

/**
 * Пастельный фон из насыщенного цвета: подмешивает белый.
 * Нужен потому, что в БД у категории только один цвет, а дизайн
 * требует пары «светлая плашка + насыщенная иконка».
 */
export function tint(hex: string, amount = 0.14): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return 'var(--color-surface-2)'
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const mix = (c: number) => Math.round(255 - (255 - c) * amount)
  return `rgb(${mix(r)} ${mix(g)} ${mix(b)})`
}

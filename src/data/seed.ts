import type { Category, ThemeName } from '../types'

export interface ThemeDef {
  label: string
  primary: string
  primary2: string
}

/** Акценты глубокие, «благородные»; бумага и ink одинаковы во всех темах */
export const THEMES: Record<ThemeName, ThemeDef> = {
  lavender: { label: 'Индиго', primary: '#4F46E5', primary2: '#3730A3' },
  mint: { label: 'Изумруд', primary: '#0E9F6E', primary2: '#0B7A55' },
  pink: { label: 'Слива', primary: '#7C3AED', primary2: '#5B21B6' },
  blue: { label: 'Сталь', primary: '#2563EB', primary2: '#1D4ED8' },
  neutral: { label: 'Графит', primary: '#57534E', primary2: '#44403C' },
}

export const CATEGORY_ICONS = ['cart', 'cup', 'train', 'house', 'balloon', 'health', 'tag', 'hanger', 'bulb', 'phone', 'burger', 'coins'] as const

export const GOAL_EMOJIS = ['🎯', '🚗', '🏠', '✈️', '💻', '📱', '💍', '🎓', '🎮', '🐱', '🏖️', '🛡️']

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Продукты', icon: 'cart', color: '#0E9F6E', monthlyLimit: 15000, sortOrder: 0, isArchived: false },
  { name: 'Кафе и рестораны', icon: 'cup', color: '#B3402A', monthlyLimit: 5000, sortOrder: 1, isArchived: false },
  { name: 'Транспорт', icon: 'train', color: '#2563EB', monthlyLimit: 3000, sortOrder: 2, isArchived: false },
  { name: 'Жильё', icon: 'house', color: '#6D28D9', monthlyLimit: 25000, sortOrder: 3, isArchived: false },
  { name: 'Развлечения', icon: 'balloon', color: '#C2660E', monthlyLimit: 4000, sortOrder: 4, isArchived: false },
  { name: 'Здоровье', icon: 'health', color: '#0891B2', monthlyLimit: 3000, sortOrder: 5, isArchived: false },
  { name: 'Прочее', icon: 'tag', color: '#57534E', monthlyLimit: 0, sortOrder: 6, isArchived: false },
]

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

/** Иконка категории с фолбэком для старых данных */
export function iconOf(cat: Pick<Category, 'icon'>): string {
  return cat.icon ?? 'tag'
}

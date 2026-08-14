import type { Category, ThemeName } from '../types'

export const THEMES: Record<ThemeName, { label: string; bg: string; accent: string; accent2: string }> = {
  pink: { label: 'Розовая', bg: '#FFF1F4', accent: '#F7A8C0', accent2: '#F48FB1' },
  mint: { label: 'Мятная', bg: '#EAFBF3', accent: '#7FD8B0', accent2: '#54C99A' },
  lavender: { label: 'Лавандовая', bg: '#F3F0FF', accent: '#B6A1EE', accent2: '#9B85E0' },
  blue: { label: 'Голубая', bg: '#EEF6FF', accent: '#8FBEF7', accent2: '#6FA8F0' },
  neutral: { label: 'Нейтральная', bg: '#F6F6F8', accent: '#9AA0AC', accent2: '#7E8593' },
}

export const PALETTE = [
  '#B6A1EE', '#7FD8B0', '#F7A8C0', '#8FBEF7', '#F7C66B',
  '#E29FD6', '#7FD3D8', '#F49B7A', '#A6D86E', '#C0A3F0',
]

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Продукты', emoji: '🛒', color: '#7FD8B0', monthlyLimit: 15000, sortOrder: 0, isArchived: false },
  { name: 'Кафе и рестораны', emoji: '☕', color: '#F7A8C0', monthlyLimit: 5000, sortOrder: 1, isArchived: false },
  { name: 'Транспорт', emoji: '🚇', color: '#8FBEF7', monthlyLimit: 3000, sortOrder: 2, isArchived: false },
  { name: 'Жильё', emoji: '🏠', color: '#B6A1EE', monthlyLimit: 25000, sortOrder: 3, isArchived: false },
  { name: 'Развлечения', emoji: '🎉', color: '#F7C66B', monthlyLimit: 4000, sortOrder: 4, isArchived: false },
  { name: 'Здоровье', emoji: '💊', color: '#7FD3D8', monthlyLimit: 3000, sortOrder: 5, isArchived: false },
  { name: 'Прочее', emoji: '📦', color: '#C0A3F0', monthlyLimit: 0, sortOrder: 6, isArchived: false },
]

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

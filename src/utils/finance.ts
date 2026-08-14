import type { Category, Goal, Operation, User } from '../types'

export function periodKeyForDate(date: Date, periodStartDay: number): string {
  const d = new Date(date)
  if (d.getDate() < periodStartDay) {
    d.setMonth(d.getMonth() - 1)
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function periodBounds(periodKey: string, periodStartDay: number): { start: Date; end: Date } {
  const [y, m] = periodKey.split('-').map(Number)
  const start = new Date(y, m - 1, periodStartDay)
  const end = new Date(y, m, periodStartDay - 1, 23, 59, 59)
  return { start, end }
}

export function formatMoney(amount: number, currency = '₽'): string {
  const v = Math.round(amount)
  return `${v.toLocaleString('ru-RU')} ${currency}`
}

export function monthLabel(periodKey: string, periodStartDay: number): string {
  const [y, m] = periodKey.split('-').map(Number)
  const base = new Date(y, m - 1, periodStartDay)
  return base.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}

export function categorySpent(ops: Operation[], catId: string, periodKey: string, periodStartDay: number): number {
  const { start, end } = periodBounds(periodKey, periodStartDay)
  return ops
    .filter(o => o.type === 'expense' && o.categoryId === catId && inRange(o.date, start, end))
    .reduce((s, o) => s + o.amount, 0)
}

export function periodIncome(ops: Operation[], periodKey: string, periodStartDay: number): number {
  const { start, end } = periodBounds(periodKey, periodStartDay)
  return ops
    .filter(o => o.type === 'income' && inRange(o.date, start, end))
    .reduce((s, o) => s + o.amount, 0)
}

export function periodExpense(ops: Operation[], periodKey: string, periodStartDay: number): number {
  const { start, end } = periodBounds(periodKey, periodStartDay)
  return ops
    .filter(o => o.type === 'expense' && inRange(o.date, start, end))
    .reduce((s, o) => s + o.amount, 0)
}

export function inRange(iso: string, start: Date, end: Date): boolean {
  const d = new Date(iso + 'T00:00:00')
  return d >= start && d <= end
}

export interface CategoryStatus {
  spent: number
  limit: number
  remaining: number
  pct: number
  state: 'none' | 'ok' | 'warn' | 'over'
}

export function categoryStatus(cat: Category, spent: number): CategoryStatus {
  if (!cat.monthlyLimit || cat.monthlyLimit <= 0) {
    return { spent, limit: 0, remaining: 0, pct: 0, state: 'none' }
  }
  const remaining = cat.monthlyLimit - spent
  const pct = Math.min(100, (spent / cat.monthlyLimit) * 100)
  let state: CategoryStatus['state'] = 'ok'
  if (spent > cat.monthlyLimit) state = 'over'
  else if (pct >= 80) state = 'warn'
  return { spent, limit: cat.monthlyLimit, remaining, pct, state }
}

export function goalProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0
  return Math.min(100, (goal.savedAmount / goal.targetAmount) * 100)
}

export function daysLeft(periodKey: string, periodStartDay: number): number {
  const { end } = periodBounds(periodKey, periodStartDay)
  const now = new Date()
  const diff = Math.ceil((end.getTime() - now.getTime()) / 86400000)
  return Math.max(0, diff)
}

export function emptyUser(): User {
  return {
    id: 'local',
    telegramId: null,
    name: 'Друг',
    currency: '₽',
    periodStartDay: 1,
    theme: 'lavender',
    onboarded: false,
  }
}

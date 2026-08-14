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
  return `${v.toLocaleString('ru-RU')} ${currency}`
}

export function monthLabel(periodKey: string, periodStartDay: number): string {
  const [y, m] = periodKey.split('-').map(Number)
  const base = new Date(y, m - 1, periodStartDay)
  return base.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
}

export function dateLabel(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function inRange(iso: string, start: Date, end: Date): boolean {
  const d = new Date(iso + 'T00:00:00')
  return d >= start && d <= end
}

/** Операция относится к периоду и создана после возможного сброса месяца */
function inPeriod(o: Operation, start: Date, end: Date, sinceTs?: number): boolean {
  return inRange(o.date, start, end) && o.createdAt >= (sinceTs ?? 0)
}

export function categorySpent(ops: Operation[], catId: string, periodKey: string, periodStartDay: number, sinceTs?: number): number {
  const { start, end } = periodBounds(periodKey, periodStartDay)
  return ops
    .filter(o => o.type === 'expense' && o.categoryId === catId && inPeriod(o, start, end, sinceTs))
    .reduce((s, o) => s + o.amount, 0)
}

export function periodIncome(ops: Operation[], periodKey: string, periodStartDay: number, sinceTs?: number): number {
  const { start, end } = periodBounds(periodKey, periodStartDay)
  return ops
    .filter(o => o.type === 'income' && inPeriod(o, start, end, sinceTs))
    .reduce((s, o) => s + o.amount, 0)
}

export function periodExpense(ops: Operation[], periodKey: string, periodStartDay: number, sinceTs?: number): number {
  const { start, end } = periodBounds(periodKey, periodStartDay)
  return ops
    .filter(o => o.type === 'expense' && inPeriod(o, start, end, sinceTs))
    .reduce((s, o) => s + o.amount, 0)
}

/** Пополнения целей в периоде — уменьшают «свободные» деньги */
export function periodGoalContribution(ops: Operation[], periodKey: string, periodStartDay: number, sinceTs?: number): number {
  const { start, end } = periodBounds(periodKey, periodStartDay)
  return ops
    .filter(o => o.type === 'goal_contribution' && inPeriod(o, start, end, sinceTs))
    .reduce((s, o) => s + o.amount, 0)
}

export function periodNet(ops: Operation[], periodKey: string, periodStartDay: number, sinceTs?: number): number {
  return periodIncome(ops, periodKey, periodStartDay, sinceTs)
    - periodExpense(ops, periodKey, periodStartDay, sinceTs)
    - periodGoalContribution(ops, periodKey, periodStartDay, sinceTs)
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

/** Дней прошло от начала периода (включая текущий день) */
export function daysElapsed(periodKey: string, periodStartDay: number): number {
  const { start } = periodBounds(periodKey, periodStartDay)
  const now = new Date()
  const diff = Math.floor((now.getTime() - start.getTime()) / 86400000) + 1
  return Math.max(1, diff)
}

/** Дней в периоде */
export function daysTotal(periodKey: string, periodStartDay: number): number {
  const { start, end } = periodBounds(periodKey, periodStartDay)
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1
}

/** Прогресс периода в % (сколько времени уже прошло) */
export function periodProgress(periodKey: string, periodStartDay: number): number {
  return Math.min(100, (daysElapsed(periodKey, periodStartDay) / daysTotal(periodKey, periodStartDay)) * 100)
}

/** Прогноз расхода к концу периода: spent / elapsed * total */
export function forecastExpense(spent: number, periodKey: string, periodStartDay: number): number | null {
  const elapsed = daysElapsed(periodKey, periodStartDay)
  if (elapsed < 1) return null
  return (spent / elapsed) * daysTotal(periodKey, periodStartDay)
}

/** Безопасный дневной лимит: сколько можно тратить в день до конца периода */
export function dailyRate(remaining: number, periodKey: string, periodStartDay: number): number {
  return remaining / Math.max(1, daysLeft(periodKey, periodStartDay))
}

/** Предыдущий период */
export function prevPeriodKey(periodKey: string): string {
  const [y, m] = periodKey.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
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
    monthResetAt: null,
  }
}
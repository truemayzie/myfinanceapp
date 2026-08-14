import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BudgetPlan, Category, Goal, Operation, OperationType, SupportTicket, User,
} from '../types'
import { DEFAULT_CATEGORIES, uid } from '../data/seed'
import { emptyUser, periodKeyForDate } from '../utils/finance'
import { getUserFromTelegram } from '../telegram'

export const SYNC_ENABLED = !!import.meta.env.VITE_API_BASE

interface State {
  user: User
  categories: Category[]
  operations: Operation[]
  goals: Goal[]
  plans: BudgetPlan[]
  tickets: SupportTicket[]
  hydrated: boolean

  updateUser: (patch: Partial<User>) => void
  completeOnboarding: (data: Partial<User>) => void

  addOperation: (op: { type: OperationType; amount: number; categoryId?: string | null; goalId?: string | null; date?: string; comment?: string; source?: Operation['source'] }) => void
  deleteOperation: (id: string) => void

  addCategory: (c: Omit<Category, 'id'>) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void

  addGoal: (g: Omit<Goal, 'id'>) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  contributeGoal: (id: string, amount: number, comment?: string) => void
  setPrimaryGoal: (id: string) => void

  savePlan: (plan: BudgetPlan) => void

  /** Сбрасывает отображение трат текущего периода (операции остаются в истории) */
  resetPeriod: (periodKey: string) => void

  sendSupport: (message: string) => void

  _replace: (partial: Partial<State>) => void
  setHydrated: (v: boolean) => void
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: emptyUser(),
      categories: DEFAULT_CATEGORIES.map(c => ({ ...c, id: uid() })),
      operations: [],
      goals: [],
      plans: [],
      tickets: [],
      hydrated: !SYNC_ENABLED,

      updateUser: (patch) => set(s => ({ user: { ...s.user, ...patch } })),

      completeOnboarding: (data) => set(s => {
        const tg = getUserFromTelegram()
        return { user: { ...s.user, ...data, telegramId: tg.telegramId, onboarded: true } }
      }),

      addOperation: ({ type, amount, categoryId = null, goalId = null, date, comment = '', source = 'manual' }) =>
        set(s => ({
          operations: [
            ...s.operations,
            {
              id: uid(), type, amount, categoryId, goalId,
              date: date ?? todayISO(), comment, source, createdAt: Date.now(),
            },
          ],
        })),

      deleteOperation: (id) => set(s => ({ operations: s.operations.filter(o => o.id !== id) })),

      addCategory: (c) => set(s => ({ categories: [...s.categories, { ...c, id: uid() }] })),
      updateCategory: (id, patch) =>
        set(s => ({ categories: s.categories.map(c => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCategory: (id) => set(s => ({ categories: s.categories.filter(c => c.id !== id) })),

      addGoal: (g) => set(s => ({ goals: [...s.goals, { ...g, id: uid() }] })),
      updateGoal: (id, patch) =>
        set(s => ({ goals: s.goals.map(g => (g.id === id ? { ...g, ...patch } : g)) })),
      deleteGoal: (id) => set(s => ({ goals: s.goals.filter(g => g.id !== id) })),

      contributeGoal: (id, amount, comment = '') =>
        set(s => {
          const goals = s.goals.map(g =>
            g.id === id
              ? { ...g, savedAmount: g.savedAmount + amount, status: g.savedAmount + amount >= g.targetAmount ? 'done' : g.status }
              : g,
          )
          const op: Operation = {
            id: uid(), type: 'goal_contribution', amount, categoryId: null, goalId: id,
            date: todayISO(), comment, source: 'manual', createdAt: Date.now(),
          }
          return { goals, operations: [...s.operations, op] }
        }),

      setPrimaryGoal: (id) =>
        set(s => ({ goals: s.goals.map(g => ({ ...g, isPrimary: g.id === id })) })),

      savePlan: (plan) =>
        set(s => {
          const others = s.plans.filter(p => p.periodKey !== plan.periodKey)
          return { plans: [...others, plan] }
        }),

      resetPeriod: (periodKey) =>
        set(s => ({ user: { ...s.user, monthResetAt: Date.now() } })),

      sendSupport: (message) =>
        set(s => ({
          tickets: [
            ...s.tickets,
            { id: uid(), message, status: 'sent', createdAt: Date.now() },
          ],
        })),

      _replace: (partial) => set(partial),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    { name: 'finance-miniapp-v1' },
  ),
)

export function currentPeriodKey(): string {
  const { user } = useStore.getState()
  return periodKeyForDate(new Date(), user.periodStartDay)
}

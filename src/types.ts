export type ThemeName = 'pink' | 'mint' | 'lavender' | 'blue' | 'neutral'

export type OperationType = 'income' | 'expense' | 'goal_contribution'

export type OperationSource = 'manual' | 'tbank_push' | 'tbank_export'

export interface User {
  id: string
  telegramId: number | null
  name: string
  currency: string
  periodStartDay: number
  theme: ThemeName
  onboarded: boolean
}

export interface Category {
  id: string
  name: string
  emoji: string
  color: string
  monthlyLimit: number
  sortOrder: number
  isArchived: boolean
}

export interface Operation {
  id: string
  type: OperationType
  amount: number
  categoryId: string | null
  goalId: string | null
  date: string // ISO date (YYYY-MM-DD)
  comment: string
  source: OperationSource
  createdAt: number
}

export interface Goal {
  id: string
  title: string
  targetAmount: number
  savedAmount: number
  coverImage: string
  emoji: string
  deadline: string | null
  isPrimary: boolean
  status: 'active' | 'done' | 'archived'
}

export interface BudgetPlan {
  periodKey: string // e.g. 2026-08
  incomePlanned: number
  categoryLimits: Record<string, number>
  goalContribution: number
}

export interface SupportTicket {
  id: string
  message: string
  status: 'new' | 'sent'
  createdAt: number
}

import { ArrowDownLeft, Target } from 'lucide-react'
import type { Category, Goal, Operation } from '../types'
import { Sign, SignRaw } from './ui/Card'
import { Icon } from './icons'

/** Цвета не-категорийных операций — хексы, чтобы tint() смог посчитать пастель */
const INCOME = '#1d7a62'
const GOAL = '#c48928'
const NEUTRAL = '#77776f'

/** Плашка операции: категория для расхода, свои цвета для дохода и цели */
export function OpSign({ op, cat, size = 38 }: { op: Operation; cat?: Category; size?: number }) {
  const iconSize = Math.round(size * 0.44)
  if (op.type === 'income') {
    return (
      <SignRaw color={INCOME} size={size}>
        <ArrowDownLeft size={iconSize} strokeWidth={1.9} />
      </SignRaw>
    )
  }
  if (op.type === 'goal_contribution') {
    return (
      <SignRaw color={GOAL} size={size}>
        <Target size={iconSize} strokeWidth={1.9} />
      </SignRaw>
    )
  }
  if (cat) return <Sign cat={cat} size={size} iconSize={iconSize} />
  return (
    <SignRaw color={NEUTRAL} size={size}>
      <Icon name="tag" size={iconSize} />
    </SignRaw>
  )
}

export function opTitle(op: Operation, cat?: Category, goal?: Goal): string {
  if (op.type === 'income') return 'Доход'
  if (op.type === 'goal_contribution') return goal?.title ?? 'В цель'
  return cat?.name ?? 'Без категории'
}

const SOURCE_LABEL: Record<string, string> = {
  tbank_push: 'из пуша банка',
  tbank_export: 'из выписки',
  manual: 'вручную',
}

export function opSubtitle(op: Operation): string {
  const time = op.createdAt
    ? new Date(op.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : ''
  const what = op.comment || SOURCE_LABEL[op.source] || 'вручную'
  return time ? `${what} · ${time}` : what
}

/** Сумма со знаком: расход минусом, приход плюсом */
export function opAmount(op: Operation, currency = '₽'): string {
  const sign = op.type === 'expense' ? '−' : '+'
  return `${sign}${Math.round(op.amount).toLocaleString('ru-RU')} ${currency}`
}

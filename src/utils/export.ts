import type { Category, Goal, Operation } from '../types'

export function exportCSV(operations: Operation[], categories: Category[], goals: Goal[]) {
  const catName = (id: string | null) => categories.find(c => c.id === id)?.name ?? '—'
  const goalName = (id: string | null) => goals.find(g => g.id === id)?.title ?? '—'
  const rows = [
    ['дата', 'тип', 'сумма', 'категория', 'цель', 'комментарий', 'источник'],
    ...operations
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(o => [
        o.date,
        o.type === 'income' ? 'доход' : o.type === 'expense' ? 'расход' : 'в цель',
        String(o.amount),
        catName(o.categoryId),
        goalName(o.goalId),
        o.comment,
        o.source,
      ]),
  ]
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `finance-export-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
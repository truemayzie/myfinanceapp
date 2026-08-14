import { useStore, currentPeriodKey } from '../store/useStore'
import { periodBounds, periodKeyForDate } from '../utils/finance'
import { DEFAULT_CATEGORIES } from '../data/seed'

export type MockKind = 'empty' | 'normal' | 'over'

const rnd = (min: number, max: number) => Math.round(min + Math.random() * (max - min))

function randDate(start: Date, end: Date): string {
  const ms = start.getTime() + Math.random() * Math.max(0, end.getTime() - start.getTime())
  return new Date(ms).toISOString().slice(0, 10)
}

function dayOf(offsetDaysFromStart: number, start: Date): string {
  const d = new Date(start)
  d.setDate(d.getDate() + offsetDaysFromStart)
  if (d.getTime() > Date.now()) d.setTime(Date.now())
  return d.toISOString().slice(0, 10)
}

/** Наполняет приложение демо-данными. `empty` ничего не меняет. */
export function seedMock(kind: MockKind) {
  if (kind === 'empty') return 0
  const { user, updateCategory, savePlan } = useStore.getState()
  if (useStore.getState().operations.length > 0) return 0

  const pk = currentPeriodKey()
  const { start, end } = periodBounds(pk, user.periodStartDay)
  const last = end.getTime() > Date.now() ? new Date() : end

  let counter = 0
  const op = useStore.getState().addOperation
  const add = (type: 'income' | 'expense', amount: number, categoryId?: string | null, date?: string, comment = '') => {
    const p = periodKeyForDate(new Date(date!), user.periodStartDay)
    const current = useStore.getState().operations.filter(o =>
      o.date.slice(0, 7) === p && o.type === type,
    ).reduce((s, o) => s + o.amount, 0)
    void current
    op({ type, amount, categoryId: categoryId ?? null, date, comment })
    counter++
  }

  // Доходы
  add('income', rnd(52000, 58000), null, dayOf(0, start), 'Зарплата')
  add('income', rnd(8000, 12000), null, dayOf(8, start), 'Фриланс')

  // Расходы по категориям с реалистичными весами
  const weights: Record<string, [number, number, number]> = {}
  const over = kind === 'over'
  const cats = useStore.getState().categories
  cats.forEach((c, i) => {
    const base = [0.28, 0.1, 0.06, 0.3, 0.08, 0.05, 0.06][i % 7] ?? 0.05
    weights[c.id] = [2000, 9000, 3]
    switch (DEFAULT_CATEGORIES[i % DEFAULT_CATEGORIES.length]?.name) {
      case 'Продукты': weights[c.id] = [6000, 12000, 10]; break
      case 'Кафе и рестораны': weights[c.id] = over ? [5000, 12000, 9] : [2000, 6000, 7]; break
      case 'Транспорт': weights[c.id] = [800, 3000, 8]; break
      case 'Жильё': weights[c.id] = [16000, 22000, 2]; break
      case 'Развлечения': weights[c.id] = over ? [4000, 10000, 8] : [1000, 4000, 5]; break
      case 'Здоровье': weights[c.id] = [500, 3500, 3]; break
      case 'Прочее': weights[c.id] = [300, 2000, 5]; break
    }
    void base
  })

  for (const c of cats) {
    const [lo, hi, n] = weights[c.id] ?? [500, 2000, 3]
    for (let i = 0; i < n; i++) {
      add('expense', rnd(lo, hi), c.id, randDate(start, last))
    }
  }

  // Цели
  const { addGoal, contributeGoal } = useStore.getState()
  addGoal({ title: 'Подушка безопасности', targetAmount: 100000, savedAmount: 0, emoji: '🛡️', isPrimary: true, status: 'active' })
  const g1 = useStore.getState().goals[useStore.getState().goals.length - 1]
  addGoal({ title: 'Отпуск в горах', targetAmount: 60000, savedAmount: 0, emoji: '🏔️', isPrimary: false, status: 'active' })
  const g2 = useStore.getState().goals[useStore.getState().goals.length - 1]

  const contribs = over ? [6000, 8000, 10000] : [4000, 5000, 6000]
  contribs.forEach((v, i) => contributeGoal(g1.id, v, `Пополнение ${i + 1}`))
  contributeGoal(g2.id, 2500, 'В копилку')

  // План
  savePlan({
    periodKey: pk,
    incomePlanned: over ? 70000 : 60000,
    categoryLimits: Object.fromEntries(cats.map(c => [c.id, c.monthlyLimit])),
    goalContribution: 8000,
  })
  cats.slice(0, 4).forEach(c => updateCategory(c.id, { monthlyLimit: c.monthlyLimit * (over ? 0.8 : 1) }))

  return counter
}
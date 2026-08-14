import { useMemo } from 'react'
import { useStore, currentPeriodKey } from '../store/useStore'
import { formatMoney, periodBounds, periodExpense, periodIncome } from '../utils/finance'
import Donut from '../components/charts/Donut'
import BarChart from '../components/charts/BarChart'
import Heatmap from '../components/charts/Heatmap'
import { TopBar } from '../components/ui/TopBar'

function inPeriodByIso(o: { date: string; createdAt: number }, startIso: string, endIso: string, since?: number) {
  return o.date >= startIso && o.date <= endIso && o.createdAt >= (since ?? 0)
}

export default function Analytics() {
  const { user, categories, operations } = useStore()
  const pk = currentPeriodKey()
  const since = user.monthResetAt ?? undefined

  const { start, end } = useMemo(() => periodBounds(pk, user.periodStartDay), [pk, user.periodStartDay])
  const startIso = start.toISOString().slice(0, 10)
  const endIso = end.toISOString().slice(0, 10)

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    operations
      .filter(o => o.type === 'expense' && inPeriodByIso(o, startIso, endIso, since))
      .forEach(o => map.set(o.categoryId ?? 'none', (map.get(o.categoryId ?? 'none') ?? 0) + o.amount))
    return [...map.entries()]
      .map(([cid, value]) => {
        const c = categories.find(x => x.id === cid)
        return { value, color: c?.color ?? '#C0A3F0', label: c?.name ?? 'Без категории' }
      })
      .sort((a, b) => b.value - a.value)
  }, [operations, startIso, endIso, since, categories])

  const byMonth = useMemo(() => {
    const out: { label: string; income: number; expense: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      out.push({
        label: d.toLocaleDateString('ru-RU', { month: 'short' }),
        income: periodIncome(operations, key, 1),
        expense: periodExpense(operations, key, 1),
      })
    }
    return out
  }, [operations])

  const dayAmounts = useMemo(() => {
    const map: Record<number, number> = {}
    operations
      .filter(o => o.type === 'expense' && inPeriodByIso(o, startIso, endIso, since))
      .forEach(o => {
        const day = new Date(o.date + 'T00:00:00').getDate()
        map[day] = (map[day] ?? 0) + o.amount
      })
    return map
  }, [operations, startIso, endIso, since])

  return (
    <div>
      <TopBar title="Аналитика" />

      <div className="card">
        <div className="card-title">Расходы по категориям</div>
        <Donut segments={byCategory} />
        <div style={{ marginTop: 12 }}>
          {byCategory.map(s => (
            <div className="cat-row" key={s.label} style={{ padding: '6px 0' }}>
              <div className="cat-emoji" style={{ width: 28, height: 28, fontSize: 14, background: s.color + '33' }} />
              <div className="cat-info"><div className="cat-name" style={{ fontSize: 14 }}>{s.label}</div></div>
              <div className="cat-amount">{formatMoney(s.value)}</div>
            </div>
          ))}
          {byCategory.length === 0 && <p className="muted">Нет расходов за период.</p>}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Доходы и расходы по месяцам</div>
        <BarChart data={byMonth} />
      </div>

      <div className="card">
        <div className="card-title">Траты по дням</div>
        <Heatmap periodKey={pk} periodStartDay={user.periodStartDay} dayAmounts={dayAmounts} />
      </div>
    </div>
  )
}
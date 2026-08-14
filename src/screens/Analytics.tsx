import { useMemo } from 'react'
import { useStore, currentPeriodKey } from '../store/useStore'
import { formatMoney, periodBounds, prevPeriodKey } from '../utils/finance'
import { AppHeader, Section } from '../components/ui/AppHeader'
import Donut from '../components/charts/Donut'
import { Icon, IconName } from '../components/icons'
import BarChart from '../components/charts/BarChart'
import Heatmap from '../components/charts/Heatmap'
import { EmptyState } from '../components/ui/EmptyState'

export default function Analytics() {
  const user = useStore(s => s.user)
  const categories = useStore(s => s.categories)
  const operations = useStore(s => s.operations)
  const pk = currentPeriodKey()
  const since = user.monthResetAt ?? undefined

  const data = useMemo(() => {
    const active = categories.filter(c => !c.isArchived)
    const byCat = new Map<string, number>()
    const byDay = new Map<number, number>()
    let total = 0
    operations.forEach(o => {
      if (o.type !== 'expense') return
      if (!inPk(o.date, pk, user.periodStartDay)) return
      if (since && o.createdAt < since) return
      total += o.amount
      if (o.categoryId) byCat.set(o.categoryId, (byCat.get(o.categoryId) ?? 0) + o.amount)
      const day = new Date(o.date + 'T00:00:00').getDate()
      byDay.set(day, (byDay.get(day) ?? 0) + o.amount)
    })
    const rows = active
      .map(c => ({ cat: c, spent: byCat.get(c.id) ?? 0 }))
      .filter(r => r.spent > 0)
      .sort((a, b) => b.spent - a.spent)
    const top = rows[0] ?? null
    return { total, rows, byDay: Object.fromEntries(byDay), top }
  }, [operations, categories, pk, since, user.periodStartDay])

  const monthly = useMemo(() => {
    const list: { label: string; income: number; expense: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const [y, m] = pk.split('-').map(Number)
      const d = new Date(y, m - 1 - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const inc = operations.filter(o => o.type === 'income' && o.date.slice(0, 7) === key).reduce((s, o) => s + o.amount, 0)
      const exp = operations.filter(o => o.type === 'expense' && o.date.slice(0, 7) === key).reduce((s, o) => s + o.amount, 0)
      list.push({ label: d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''), income: inc, expense: exp })
    }
    return list
  }, [operations, pk])

  const hasData = data.total > 0

  if (!hasData) {
    return (
      <div>
        <AppHeader title="Аналитика" subtitle="Структура расходов" />
        <EmptyState icon="bars" title="Нечего анализировать" text="После первых расходов здесь появятся доли категорий и динамика." />
      </div>
    )
  }

  const segs = data.rows.slice(0, 6).map(r => ({ value: r.spent, color: r.cat.color, label: r.cat.name }))
  const topShare = data.total > 0 && data.top ? Math.round((data.top.spent / data.total) * 100) : 0

  return (
    <div>
      <AppHeader title="Аналитика" subtitle="Структура расходов" />

      <Section title="Доли категорий" />
      <Donut segments={segs} />
      <div className="share-list">
        {data.rows.map(r => {
          const pct = Math.round((r.spent / data.total) * 100)
          return (
            <div key={r.cat.id} className="share-row">
              <i className="sig" style={{ background: r.cat.color }}><Icon name={(r.cat.icon ?? 'tag') as IconName} size={15} /></i>
              <span className="row-main"><b>{r.cat.name}</b></span>
              <span className="share-pct num">{pct}%</span>
              <span className="row-amount num">{formatMoney(r.spent)}</span>
            </div>
          )
        })}
      </div>

      <Section title="Динамика за 6 месяцев" />
      <div className="panel">
        <BarChart data={monthly} />
      </div>

      <Section title="Календарь трат" />
      <div className="panel">
        <Heatmap periodKey={pk} periodStartDay={user.periodStartDay} dayAmounts={data.byDay} />
      </div>

      <p className="insight">
        {data.top
          ? `Крупнейшая статья — «${data.top.cat.name}»: ${topShare}% всех расходов периода (${formatMoney(data.top.spent)}).`
          : 'Пока нет трат для анализа.'}
      </p>
    </div>
  )
}

function inPk(date: string, pk: string, startDay: number): boolean {
  return date.startsWith(pk) || dateStartsInPrev(date, pk, startDay)
}

function dateStartsInPrev(date: string, pk: string, startDay: number): boolean {
  if (startDay <= 1) return false
  const prev = prevPeriodKey(pk)
  const d = new Date(date + 'T00:00:00')
  const { start } = periodBounds(pk, startDay)
  return date.startsWith(prev) && d.getDate() >= startDay
}
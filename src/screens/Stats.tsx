import { useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, CalendarDays, Gauge, Target, Wallet } from 'lucide-react'
import { useStore, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import {
  categorySpent,
  categoryStatus,
  dailyRate,
  forecastExpense,
  formatMoney,
  monthLabel,
  periodBounds,
  periodExpense,
  periodIncome,
  periodNet,
  periodProgress,
  prevPeriodKey,
} from '../utils/finance'
import { Track } from '../components/Sheet'
import { AppHeader, Section } from '../components/ui/AppHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { Badge, Card, Row, Sign, StatTile } from '../components/ui/Card'
import Donut from '../components/charts/Donut'
import BarChart from '../components/charts/BarChart'
import Heatmap from '../components/charts/Heatmap'
import { cn } from '../lib/cn'

export default function Stats() {
  const user = useStore(s => s.user)
  const categories = useStore(s => s.categories)
  const operations = useStore(s => s.operations)
  const plans = useStore(s => s.plans)
  const { openSheet } = useApp()

  const pk = currentPeriodKey()
  const since = user.monthResetAt ?? undefined
  const cur = user.currency
  const plan = plans.find(p => p.periodKey === pk)

  const income = periodIncome(operations, pk, user.periodStartDay, since)
  const expense = periodExpense(operations, pk, user.periodStartDay, since)
  const free = periodNet(operations, pk, user.periodStartDay, since)

  // Лимит категории может быть переопределён планом периода
  const limitOf = (id: string, fallback: number) => plan?.categoryLimits?.[id] ?? fallback
  const activeCats = categories.filter(c => !c.isArchived)
  const limitTotal = activeCats.reduce((s, c) => s + Math.max(0, limitOf(c.id, c.monthlyLimit)), 0)
  const over = limitTotal > 0 && expense > limitTotal

  const forecast = forecastExpense(expense, pk, user.periodStartDay)
  const rate = dailyRate(Math.max(0, limitTotal - expense), pk, user.periodStartDay)
  const timePct = periodProgress(pk, user.periodStartDay)

  const dist = useMemo(() => {
    const byCat = new Map<string, number>()
    const byDay = new Map<number, number>()
    let total = 0
    const { start, end } = periodBounds(pk, user.periodStartDay)
    operations.forEach(o => {
      if (o.type !== 'expense') return
      const d = new Date(o.date + 'T00:00:00')
      if (d < start || d > end) return
      if (since && o.createdAt < since) return
      total += o.amount
      if (o.categoryId) byCat.set(o.categoryId, (byCat.get(o.categoryId) ?? 0) + o.amount)
      byDay.set(d.getDate(), (byDay.get(d.getDate()) ?? 0) + o.amount)
    })
    const rows = categories
      .filter(c => !c.isArchived)
      .map(c => ({ cat: c, spent: byCat.get(c.id) ?? 0 }))
      .filter(r => r.spent > 0)
      .sort((a, b) => b.spent - a.spent)
    return { total, rows, byDay: Object.fromEntries(byDay), top: rows[0] ?? null }
  }, [operations, categories, pk, since, user.periodStartDay])

  const monthly = useMemo(() => {
    const list: { label: string; income: number; expense: number }[] = []
    const [y, m] = pk.split('-').map(Number)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(y, m - 1 - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      let inc = 0
      let exp = 0
      operations.forEach(o => {
        if (o.date.slice(0, 7) !== key) return
        if (o.type === 'income') inc += o.amount
        else if (o.type === 'expense') exp += o.amount
      })
      list.push({ label: d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', ''), income: inc, expense: exp })
    }
    return list
  }, [operations, pk])

  const prevExpense = useMemo(() => {
    const prev = prevPeriodKey(pk)
    return operations
      .filter(o => o.type === 'expense' && o.date.slice(0, 7) === prev)
      .reduce((s, o) => s + o.amount, 0)
  }, [operations, pk])

  const delta = prevExpense > 0 ? Math.round(((expense - prevExpense) / prevExpense) * 100) : null

  if (operations.length === 0) {
    return (
      <div>
        <AppHeader title="Статистика" eyebrow={monthLabel(pk, user.periodStartDay)} subtitle="Расходы, лимиты и динамика" />
        <EmptyState
          icon="pie"
          title="Нет данных"
          text={`За ${monthLabel(pk, user.periodStartDay).toLowerCase()} пока нет операций.`}
          action={<Button onClick={() => openSheet('quickAdd')}>Записать первый расход</Button>}
        />
      </div>
    )
  }

  const topShare = dist.total > 0 && dist.top ? Math.round((dist.top.spent / dist.total) * 100) : 0
  const segs = dist.rows.slice(0, 6).map(r => ({ value: r.spent, color: r.cat.color, label: r.cat.name }))

  return (
    <div className="space-y-8">
      <AppHeader
        title="Статистика"
        eyebrow={monthLabel(pk, user.periodStartDay)}
        subtitle="Расходы, лимиты и динамика"
        actions={
          <Button variant="ghost" size="sm" onClick={() => openSheet('budget')}>
            <Gauge className="size-4" strokeWidth={1.9} />
            Лимиты
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Доход"
          value={formatMoney(income, cur)}
          icon={<ArrowDownLeft className="size-4" strokeWidth={1.9} />}
          tone="brand"
        />
        <StatTile
          label="Расход"
          value={formatMoney(expense, cur)}
          hint={delta != null ? `${delta >= 0 ? '+' : ''}${delta}% к прошлому периоду` : undefined}
          icon={<ArrowUpRight className="size-4" strokeWidth={1.9} />}
          tone={over ? 'danger' : 'neutral'}
        />
        <StatTile
          label="Свободно"
          value={formatMoney(free, cur)}
          icon={<Wallet className="size-4" strokeWidth={1.9} />}
          tone={free >= 0 ? 'neutral' : 'danger'}
        />
        <StatTile
          label="Лимиты"
          value={limitTotal > 0 ? formatMoney(limitTotal, cur) : '—'}
          hint={limitTotal > 0 ? `использовано ${Math.round((expense / limitTotal) * 100)}%` : 'не заданы'}
          icon={<Target className="size-4" strokeWidth={1.9} />}
        />
      </div>

      {/* Прогноз по темпу */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Темп расходов</p>
            <h2 className="mt-1 text-lg font-bold tracking-[-0.035em]">Прогноз к концу периода</h2>
          </div>
          {over && <Badge tone="danger">превышен</Badge>}
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-muted">Потрачено</span>
            <b className="num font-bold">{formatMoney(expense, cur)}</b>
          </div>
          {limitTotal > 0 && (
            <div className="flex items-center justify-between gap-3 text-[13px]">
              <span className="text-muted">Безопасно в день</span>
              <b className="num font-bold">{formatMoney(rate, cur)}</b>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-muted">Прогноз к концу</span>
            <b className={cn('num font-bold', limitTotal > 0 && forecast != null && forecast > limitTotal && 'text-danger')}>
              {forecast != null ? formatMoney(forecast, cur) : '—'}
            </b>
          </div>
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-muted">Период пройден</span>
            <b className="num font-bold">{Math.round(timePct)}%</b>
          </div>
        </div>

        <div className="mt-5">
          <Track
            pct={limitTotal > 0 ? (expense / limitTotal) * 100 : 0}
            state={over ? 'over' : limitTotal > 0 && expense / limitTotal > 0.8 ? 'warn' : ''}
          />
        </div>

        <p className="mt-4 rounded-tile bg-surface-2 px-4 py-3 text-[12px] leading-5 text-ink-soft">
          {limitTotal > 0
            ? over
              ? `Расход превышает лимиты на ${formatMoney(expense - limitTotal, cur)}. Стоит пересмотреть план.`
              : `Осталось ${formatMoney(limitTotal - expense, cur)} до лимитов — примерно ${formatMoney(rate, cur)} в день.`
            : 'Задайте лимиты в плане периода, чтобы видеть прогноз и безопасный дневной расход.'}
        </p>
      </Card>

      <div>
        <Section title="План и факт" eyebrow="По категориям" actionLabel="изменить" onAction={() => openSheet('budget')} />
        <Card>
          {activeCats.map(c => {
            const spent = categorySpent(operations, c.id, pk, user.periodStartDay, since)
            const st = categoryStatus({ ...c, monthlyLimit: limitOf(c.id, c.monthlyLimit) }, spent)
            return (
              <Row key={c.id}>
                <Sign cat={c} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <b className="truncate text-[13px] font-bold">{c.name}</b>
                    {st.state === 'over' ? (
                      <Badge tone="danger" className="num">−{formatMoney(-st.remaining, cur)}</Badge>
                    ) : st.state === 'warn' ? (
                      <Badge tone="warn" className="num">осталось {formatMoney(st.remaining, cur)}</Badge>
                    ) : (
                      <b className="num shrink-0 text-[13px] font-bold">{formatMoney(st.spent, cur)}</b>
                    )}
                  </span>
                  <small className="num mt-0.5 block text-[11px] text-faint">
                    {st.limit > 0 ? `${formatMoney(st.spent, cur)} из ${formatMoney(st.limit, cur)}` : 'без лимита'}
                  </small>
                  <span className="mt-2 block">
                    <Track pct={st.pct} state={st.state} className="h-1.5" />
                  </span>
                </span>
              </Row>
            )
          })}
        </Card>
      </div>

      {dist.total > 0 && (
        <div>
          <Section title="Структура расходов" eyebrow="Доли категорий" />
          <Card className="p-5 sm:p-6">
            <div className="grid gap-7 lg:grid-cols-[192px_1fr] lg:items-center">
              <Donut segments={segs} />
              <div>
                {dist.rows.map(r => {
                  const pct = Math.round((r.spent / dist.total) * 100)
                  return (
                    <div key={r.cat.id} className="flex items-center gap-3 border-b border-line-soft py-2.5 last:border-b-0">
                      <span className="size-2.5 shrink-0 rounded-sm" style={{ background: r.cat.color }} />
                      <b className="min-w-0 flex-1 truncate text-[13px] font-bold">{r.cat.name}</b>
                      <span className="num w-9 shrink-0 text-right text-[11px] font-bold text-faint">{pct}%</span>
                      <b className="num shrink-0 text-[13px] font-bold">{formatMoney(r.spent, cur)}</b>
                    </div>
                  )
                })}
              </div>
            </div>
            {dist.top && (
              <p className="mt-5 rounded-tile bg-brand-pale px-4 py-3 text-[12px] leading-5 text-brand-deep">
                Крупнейшая статья — «{dist.top.cat.name}»: {topShare}% всех расходов периода (
                {formatMoney(dist.top.spent, cur)}).
              </p>
            )}
          </Card>
        </div>
      )}

      <div>
        <Section title="Динамика за 6 месяцев" eyebrow="Доход и расход" />
        <Card className="p-5 sm:p-6">
          <BarChart data={monthly} />
        </Card>
      </div>

      <div>
        <Section
          title="Календарь трат"
          eyebrow="По дням периода"
          action={
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-pale">
              <CalendarDays className="size-3.5" strokeWidth={1.9} />
              {monthLabel(pk, user.periodStartDay)}
            </span>
          }
        />
        <Card className="p-5 sm:p-6">
          <Heatmap periodKey={pk} periodStartDay={user.periodStartDay} dayAmounts={dist.byDay} />
        </Card>
      </div>
    </div>
  )
}

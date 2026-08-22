import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronRight, Plus, SlidersHorizontal, TrendingUp, Wallet } from 'lucide-react'
import { useStore, SYNC_ENABLED, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import {
  dailyRate,
  daysLeft,
  formatMoney,
  goalProgress,
  monthLabel,
  periodExpense,
  periodGoalContribution,
  periodIncome,
  periodNet,
} from '../utils/finance'
import { Track } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Badge, Card, Row, Sign, StatTile } from '../components/ui/Card'
import { Section } from '../components/ui/AppHeader'
import { OpSign, opAmount, opSubtitle, opTitle } from '../components/OperationRow'
import { cn } from '../lib/cn'
import { days } from '../lib/plural'

export default function Home() {
  const user = useStore(s => s.user)
  const categories = useStore(s => s.categories)
  const operations = useStore(s => s.operations)
  const goals = useStore(s => s.goals)
  const plans = useStore(s => s.plans)
  const syncMode = useStore(s => s.syncMode)
  const { openSheet, goTab } = useApp()

  const localOnly = SYNC_ENABLED && syncMode === 'local'

  const pk = currentPeriodKey()
  const since = user.monthResetAt ?? undefined
  const cur = user.currency

  const plan = plans.find(p => p.periodKey === pk)
  const income = periodIncome(operations, pk, user.periodStartDay, since)
  const expense = periodExpense(operations, pk, user.periodStartDay, since)
  const invested = periodGoalContribution(operations, pk, user.periodStartDay, since)
  const free = periodNet(operations, pk, user.periodStartDay, since)

  const budgetBase = plan?.incomePlanned || income
  const pct = budgetBase > 0 ? (expense / budgetBase) * 100 : 0
  const over = budgetBase > 0 && expense > budgetBase
  const left = daysLeft(pk, user.periodStartDay)
  const safePerDay = budgetBase > 0 ? dailyRate(Math.max(0, budgetBase - expense), pk, user.periodStartDay) : 0

  const primary = goals.find(g => g.isPrimary) ?? goals[0] ?? null
  const activeCats = categories.filter(c => !c.isArchived)

  const spentByCat = new Map<string, number>()
  operations.forEach(o => {
    if (o.type !== 'expense' || !o.categoryId) return
    if (o.date.slice(0, 7) !== pk) return
    if (since && o.createdAt < since) return
    spentByCat.set(o.categoryId, (spentByCat.get(o.categoryId) ?? 0) + o.amount)
  })
  const rows = activeCats
    .map(c => ({ cat: c, spent: spentByCat.get(c.id) ?? 0 }))
    .sort((a, b) => b.spent - a.spent)
  const maxSpent = rows[0]?.spent ?? 0

  const recent = operations
    .slice()
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0) || b.date.localeCompare(a.date))
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0">
          <p className="eyebrow">{monthLabel(pk, user.periodStartDay)}</p>
          <h1 className="mt-1.5 text-[26px] font-bold tracking-[-0.055em] sm:text-[32px]">
            Привет, {user.name}
          </h1>
          <p className="mt-1.5 text-sm text-faint">До конца периода {days(left)}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => openSheet('budget')} className="self-start sm:self-auto">
          <SlidersHorizontal className="size-4" strokeWidth={1.9} />
          План периода
        </Button>
      </div>

      {/* Тёмная карта периода */}
      <section className="relative overflow-hidden rounded-hero bg-ink p-6 text-white shadow-hero sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-white/[0.05]" />
        <div className="pointer-events-none absolute -bottom-24 -left-12 size-48 rounded-full bg-brand/25" />

        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                'rounded-full px-3 py-1 text-[10px] font-bold',
                over ? 'bg-danger text-white' : 'bg-white/10 text-white/70',
              )}
            >
              {over ? 'План превышен' : 'Текущий период'}
            </span>
            <span className="text-[11px] font-semibold text-white/45">осталось {days(left)}</span>
          </div>

          <p className="eyebrow mt-7 text-white/40">Потрачено</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="num text-[38px] font-bold leading-none tracking-[-0.055em] sm:text-[46px]">
              {formatMoney(expense, cur)}
            </span>
            {budgetBase > 0 && (
              <span className="num text-xs font-semibold text-white/45">из {formatMoney(budgetBase, cur)}</span>
            )}
          </div>

          {budgetBase > 0 ? (
            <>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pct)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    over ? 'bg-danger' : pct > 85 ? 'bg-warn' : 'bg-brand-mint',
                  )}
                />
              </div>
              <p className="mt-3 text-[11px] font-semibold text-white/50">
                {over
                  ? `Перерасход ${formatMoney(expense - budgetBase, cur)}`
                  : `${Math.round(pct)}% плана · можно тратить ${formatMoney(safePerDay, cur)} в день`}
              </p>
            </>
          ) : (
            <p className="mt-5 text-[11px] font-semibold text-white/50">
              План не задан —{' '}
              <button onClick={() => openSheet('budget')} className="font-bold text-brand-mint underline">
                задать бюджет
              </button>
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button variant="onDark" onClick={() => openSheet('quickAdd')} className="flex-1 sm:flex-none">
              <Plus className="size-[17px]" strokeWidth={2.1} />
              Записать операцию
            </Button>
            <button
              onClick={() => openSheet('add')}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3.5 text-sm font-bold text-white/80 transition hover:border-white/35 hover:text-white sm:flex-none"
            >
              Подробно
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatTile
          label="Доход"
          value={income > 0 ? formatMoney(income, cur) : '—'}
          hint={income > 0 ? 'за период' : 'ещё не записан'}
          icon={<ArrowUpRight className="size-4" strokeWidth={1.9} />}
          tone="brand"
        />
        <StatTile
          label="Свободно"
          value={formatMoney(free, cur)}
          hint={free >= 0 ? 'после трат и целей' : 'минус за период'}
          icon={<Wallet className="size-4" strokeWidth={1.9} />}
          tone={free >= 0 ? 'neutral' : 'danger'}
        />
        <StatTile
          label="В цели"
          value={invested > 0 ? formatMoney(invested, cur) : '—'}
          hint={invested > 0 ? 'отложено' : 'нет пополнений'}
          icon={<TrendingUp className="size-4" strokeWidth={1.9} />}
        />
        <StatTile
          label="Операций"
          value={String(operations.length)}
          hint="всего в базе"
          icon={<Plus className="size-4" strokeWidth={1.9} />}
        />
      </div>

      <div>
        <Section title="Куда ушли деньги" actionLabel="вся история" onAction={() => openSheet('history')} />
        {expense === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-sm font-semibold text-muted">Пока нет трат за период</p>
            <Button variant="soft" size="sm" className="mt-4" onClick={() => openSheet('quickAdd')}>
              <Plus className="size-4" strokeWidth={2.1} />
              Записать первую
            </Button>
          </Card>
        ) : (
          <Card>
            {rows.map(({ cat, spent }) => (
              <Row as="button" key={cat.id} onClick={() => openSheet('quickAdd')}>
                <Sign cat={cat} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <b className="truncate text-[13px] font-bold">{cat.name}</b>
                    <b className="num shrink-0 text-[13px] font-bold">
                      {spent > 0 ? formatMoney(spent, cur) : '—'}
                    </b>
                  </span>
                  <span className="mt-2 block">
                    <Track pct={maxSpent > 0 ? (spent / maxSpent) * 100 : 0} className="h-1.5" />
                  </span>
                </span>
              </Row>
            ))}
            <div className="flex items-center justify-between gap-3 bg-surface-3 px-4 py-3.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-faint">Всего</span>
              <b className="num text-[13px] font-bold">−{formatMoney(expense, cur)}</b>
            </div>
          </Card>
        )}
      </div>

      {recent.length > 0 && (
        <div>
          <Section title="Последние операции" actionLabel="вся история" onAction={() => openSheet('history')} />
          <Card>
            {recent.map(o => {
              const cat = categories.find(c => c.id === o.categoryId)
              const goal = goals.find(g => g.id === o.goalId)
              return (
                <Row key={o.id}>
                  <OpSign op={o} cat={cat} />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[13px] font-bold">{opTitle(o, cat, goal)}</b>
                    <small className="mt-0.5 block truncate text-[11px] text-faint">{opSubtitle(o)}</small>
                  </span>
                  <b
                    className={cn(
                      'num shrink-0 text-[13px] font-bold',
                      o.type === 'expense' ? 'text-ink' : 'text-income',
                    )}
                  >
                    {opAmount(o, cur)}
                  </b>
                </Row>
              )
            })}
          </Card>
        </div>
      )}

      {primary && (
        <button
          onClick={() => goTab('goals')}
          className="flex w-full items-center gap-4 rounded-card border border-line bg-card p-4 text-left shadow-card transition hover:border-[#d3d0c6] sm:p-5"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-pale text-[20px]">
            {primary.emoji}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <b className="truncate text-[13px] font-bold">{primary.title}</b>
              {goalProgress(primary) >= 100 && <Badge tone="ok">готово</Badge>}
            </span>
            <small className="num mt-0.5 block text-[11px] text-faint">
              {formatMoney(primary.savedAmount, cur)} из {formatMoney(primary.targetAmount, cur)}
            </small>
            <span className="mt-2 block">
              <Track pct={goalProgress(primary)} state={goalProgress(primary) >= 100 ? 'ok' : ''} className="h-1.5" />
            </span>
          </span>
          <ChevronRight className="size-[18px] shrink-0 text-pale" strokeWidth={1.8} />
        </button>
      )}

      {localOnly && (
        <p className="rounded-tile bg-warn-soft px-4 py-3 text-[11px] font-semibold leading-4 text-warn">
          Открыто вне Telegram — данные хранятся только на этом устройстве. Откройте приложение через бота, чтобы
          синхронизировать.
        </p>
      )}
    </div>
  )
}

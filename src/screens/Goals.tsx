import { ChevronRight, Pencil, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useApp } from '../AppContext'
import { formatMoney, goalProgress } from '../utils/finance'
import type { Operation } from '../types'
import { ProgressRing } from '../components/ui/ProgressRing'
import { Track } from '../components/Sheet'
import { AppHeader, Section } from '../components/ui/AppHeader'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge, Card } from '../components/ui/Card'

/** Средний темп пополнений в месяц — по месяцам, где они были */
function monthlyRate(operations: Operation[]): number {
  const months = new Map<string, number>()
  operations.forEach(o => {
    if (o.type !== 'goal_contribution') return
    const k = o.date?.slice(0, 7) ?? ''
    months.set(k, (months.get(k) ?? 0) + o.amount)
  })
  if (months.size === 0) return 0
  const total = [...months.values()].reduce((s, v) => s + v, 0)
  return total / months.size
}

function etaLabel(remaining: number, rate: number): string {
  if (remaining <= 0) return 'цель достигнута'
  if (rate <= 0) return 'темп не задан'
  const months = Math.ceil(remaining / rate)
  if (months <= 1) return 'около месяца'
  if (months < 12) return `≈ ${months} мес.`
  return `≈ ${(months / 12).toFixed(1)} года`
}

export default function Goals() {
  const goals = useStore(s => s.goals)
  const operations = useStore(s => s.operations)
  const user = useStore(s => s.user)
  const { openSheet } = useApp()

  const cur = user.currency
  const primary = goals.find(g => g.isPrimary) ?? goals[0] ?? null
  const others = goals.filter(g => g !== primary)
  const rate = monthlyRate(operations)
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0)

  if (goals.length === 0) {
    return (
      <div>
        <AppHeader title="Цели" eyebrow="Копилки" subtitle="Отпуск, техника, подушка безопасности" />
        <EmptyState
          icon="target"
          title="Ни одной цели"
          text="Создайте цель — и каждое пополнение будет видно в прогрессе."
          action={
            <Button onClick={() => openSheet('goal', {})}>
              <Plus className="size-4" strokeWidth={2.1} />
              Создать цель
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <AppHeader
        title="Цели"
        eyebrow="Копилки"
        subtitle={`Отложено всего ${formatMoney(totalSaved, cur)}`}
        actions={
          <Button variant="ghost" size="sm" onClick={() => openSheet('goal', {})}>
            <Plus className="size-4" strokeWidth={2.1} />
            Новая цель
          </Button>
        }
      />

      {primary && (
        <Card className="p-6 sm:p-7">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-7">
            <ProgressRing pct={goalProgress(primary)} size={112}>
              <div>
                <div className="text-[26px] leading-none">{primary.emoji}</div>
                <div className="num mt-1 text-[11px] font-bold text-brand">{Math.round(goalProgress(primary))}%</div>
              </div>
            </ProgressRing>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="eyebrow">Главная цель</p>
              <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">{primary.title}</h2>
              <p className="num mt-1.5 text-sm text-faint">
                {formatMoney(primary.savedAmount, cur)} <span className="text-pale">из</span>{' '}
                {formatMoney(primary.targetAmount, cur)}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                <Badge tone={goalProgress(primary) >= 100 ? 'ok' : 'neutral'}>
                  {etaLabel(primary.targetAmount - primary.savedAmount, rate)}
                </Badge>
                {rate > 0 && <Badge tone="neutral" className="num">темп {formatMoney(rate, cur)}/мес</Badge>}
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2.5 sm:justify-start">
                <Button size="sm" onClick={() => openSheet('goalContribute', { id: primary.id })}>
                  <Plus className="size-4" strokeWidth={2.1} />
                  Внести
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openSheet('goal', { id: primary.id })}>
                  <Pencil className="size-3.5" strokeWidth={1.9} />
                  Изменить
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {others.length > 0 && (
        <div>
          <Section title="Остальные цели" eyebrow={`${others.length} в работе`} />
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map(g => {
              const pct = goalProgress(g)
              const done = pct >= 100
              return (
                <div
                  key={g.id}
                  className="rounded-card border border-line bg-card p-4 shadow-card transition hover:border-[#d3d0c6] sm:p-5"
                >
                  <button onClick={() => openSheet('goal', { id: g.id })} className="flex w-full items-center gap-3 text-left">
                    <span
                      className={
                        'flex size-11 shrink-0 items-center justify-center rounded-xl text-[20px] ' +
                        (done ? 'bg-income-soft' : 'bg-brand-pale')
                      }
                    >
                      {g.emoji}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <b className="truncate text-[13px] font-bold">{g.title}</b>
                        {done && <Badge tone="ok">готово</Badge>}
                      </span>
                      <small className="num mt-0.5 block text-[11px] text-faint">
                        {formatMoney(g.savedAmount, cur)} / {formatMoney(g.targetAmount, cur)}
                      </small>
                    </span>
                    <ChevronRight className="size-[18px] shrink-0 text-pale" strokeWidth={1.8} />
                  </button>

                  <div className="mt-4">
                    <Track pct={pct} state={done ? 'ok' : ''} className="h-1.5" />
                  </div>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="num text-[11px] font-bold text-dim">{Math.round(pct)}%</span>
                    <span className="text-[11px] font-semibold text-pale">
                      {etaLabel(g.targetAmount - g.savedAmount, rate)}
                    </span>
                  </div>

                  <button
                    onClick={() => openSheet('goalContribute', { id: g.id })}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-soft py-2.5 text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
                  >
                    <Plus className="size-4" strokeWidth={2.1} />
                    Внести
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {others.length === 0 && (
        <Button block onClick={() => openSheet('goal', {})}>
          <Plus className="size-4" strokeWidth={2.1} />
          Новая цель
        </Button>
      )}
    </div>
  )
}

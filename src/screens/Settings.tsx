import { useState } from 'react'
import {
  ChevronRight,
  Download,
  History as HistoryIcon,
  LifeBuoy,
  RotateCcw,
  Smartphone,
  Sparkles,
  Tag,
} from 'lucide-react'
import { useStore, SYNC_ENABLED, currentPeriodKey } from '../store/useStore'
import { useApp } from '../AppContext'
import { exportCSV } from '../utils/export'
import { AppHeader, Section } from '../components/ui/AppHeader'
import { Field, Input } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Card, Row } from '../components/ui/Card'

export default function Settings() {
  const user = useStore(s => s.user)
  const updateUser = useStore(s => s.updateUser)
  const operations = useStore(s => s.operations)
  const categories = useStore(s => s.categories)
  const goals = useStore(s => s.goals)
  const syncMode = useStore(s => s.syncMode)
  const resetPeriod = useStore(s => s.resetPeriod)
  const { openSheet, showToast } = useApp()
  const [name, setName] = useState(user.name)

  const resetMonth = () => {
    if (confirm('Обнулить траты текущего периода? Операции останутся в истории, но перестанут влиять на бюджет.')) {
      resetPeriod(currentPeriodKey())
      showToast('Период обнулён')
    }
  }

  const rows = [
    {
      icon: Tag,
      title: 'Категории',
      hint: `${categories.filter(c => !c.isArchived).length} активных`,
      onClick: () => openSheet('categories'),
    },
    {
      icon: Smartphone,
      title: 'Импорт из Т-Банка',
      hint: 'пуши через бота',
      onClick: () => openSheet('tbank'),
    },
    {
      icon: HistoryIcon,
      title: 'История операций',
      hint: `${operations.length} записей`,
      onClick: () => openSheet('history'),
    },
    {
      icon: Download,
      title: 'Экспорт CSV',
      hint: 'выгрузить все операции',
      onClick: () => {
        if (operations.length === 0) return showToast('Нет операций для экспорта')
        exportCSV(operations, categories, goals)
        showToast('CSV скачан')
      },
    },
    {
      icon: LifeBuoy,
      title: 'Поддержка',
      hint: 'написать нам',
      onClick: () => openSheet('support'),
    },
  ]

  return (
    <div className="space-y-8">
      <AppHeader title="Настройки" eyebrow="Профиль" subtitle={`Привет, ${user.name}`} />

      <div>
        <Section title="Профиль" eyebrow="Основное" />
        <Card className="p-5 sm:p-6">
          <Field label="Имя">
            <Input value={name} onChange={e => setName(e.target.value)} onBlur={() => updateUser({ name: name.trim() || 'Друг' })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Начало периода" hint="день зарплаты, 1–28">
              <Input
                type="number"
                min={1}
                max={28}
                defaultValue={user.periodStartDay}
                onBlur={e => updateUser({ periodStartDay: Math.min(28, Math.max(1, Number(e.target.value) || 1)) })}
              />
            </Field>
            <Field label="Валюта" hint="символ в интерфейсе">
              <Input defaultValue={user.currency} onBlur={e => updateUser({ currency: e.target.value.trim() || '₽' })} />
            </Field>
          </div>
        </Card>
      </div>

      <div>
        <Section title="Данные" eyebrow="Управление" />
        <Card>
          {rows.map(r => {
            const Icon = r.icon
            return (
              <Row as="button" key={r.title} onClick={r.onClick}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted">
                  <Icon className="size-[17px]" strokeWidth={1.9} />
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[13px] font-bold">{r.title}</b>
                  <small className="mt-0.5 block truncate text-[11px] text-faint">{r.hint}</small>
                </span>
                <ChevronRight className="size-[18px] shrink-0 text-pale" strokeWidth={1.8} />
              </Row>
            )
          })}
        </Card>
      </div>

      <div>
        <Section title="Подписка" eyebrow="Скоро" />
        <div className="relative overflow-hidden rounded-card bg-ink p-6 text-white shadow-hero sm:p-7">
          <div className="pointer-events-none absolute -right-14 -top-16 size-44 rounded-full bg-brand/25" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white/70">
              <Sparkles className="size-3" strokeWidth={2} />
              PRO
            </span>
            <h3 className="mt-4 text-xl font-bold tracking-[-0.04em]">Финансы PRO</h3>
            <p className="mt-2 max-w-[380px] text-xs leading-5 text-white/55">
              Неограниченные категории, цели без лимита и приоритетная поддержка.
            </p>
            <Button variant="onDark" className="mt-5" onClick={() => showToast('Подписка — в разработке')}>
              Выбрать план
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={resetMonth}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-danger-soft py-3 text-xs font-bold text-danger transition hover:bg-danger hover:text-white"
        >
          <RotateCcw className="size-4" strokeWidth={1.9} />
          Обнулить период
        </button>
        <p className="text-center text-[11px] leading-4 text-pale">
          Операций в базе: {operations.length} ·{' '}
          {SYNC_ENABLED && syncMode === 'cloud' ? 'синхронизировано с облаком' : 'хранится на этом устройстве'}
        </p>
      </div>
    </div>
  )
}

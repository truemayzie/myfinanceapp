import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { AmountInput, Field, Input } from '../components/ui/Field'
import { Chip, ChipRow } from '../components/ui/Segmented'
import { useApp } from '../AppContext'
import { GOAL_EMOJIS } from '../data/seed'
import { formatMoney } from '../utils/finance'

export default function GoalEdit({ onClose, editId }: { onClose: () => void; editId?: string | null }) {
  const { showToast } = useApp()
  const goals = useStore(s => s.goals)
  const currency = useStore(s => s.user.currency)
  const addGoal = useStore(s => s.addGoal)
  const updateGoal = useStore(s => s.updateGoal)
  const deleteGoal = useStore(s => s.deleteGoal)
  const setPrimaryGoal = useStore(s => s.setPrimaryGoal)
  const editing = goals.find(g => g.id === editId)

  const [title, setTitle] = useState(editing?.title ?? '')
  const [target, setTarget] = useState(editing?.targetAmount ? String(editing.targetAmount) : '')
  const [icon, setIcon] = useState(editing?.emoji ?? GOAL_EMOJIS[0])
  const [confirmDelete, setConfirmDelete] = useState(false)

  const value = parseInt(target, 10) || 0
  const canSave = title.trim().length > 0 && value > 0

  const save = () => {
    if (!canSave) return
    if (editing) {
      updateGoal(editing.id, { title: title.trim(), targetAmount: value, emoji: icon })
    } else {
      addGoal({
        title: title.trim(),
        targetAmount: value,
        savedAmount: 0,
        emoji: icon,
        isPrimary: goals.length === 0,
        status: 'active',
      })
    }
    showToast(editing ? 'Цель обновлена' : 'Цель создана')
    onClose()
  }

  return (
    <Sheet
      title={editing ? 'Цель' : 'Новая цель'}
      eyebrow={editing ? 'Редактирование' : 'Создание'}
      onClose={onClose}
    >
      <div className="mb-6 flex items-center gap-4 rounded-card bg-surface-2 p-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-card text-[26px] shadow-tile">
          {icon}
        </span>
        <div className="min-w-0">
          <b className="block truncate text-sm font-bold">{title.trim() || 'Без названия'}</b>
          <small className="num mt-0.5 block text-[11px] text-faint">
            {editing
              ? `${formatMoney(editing.savedAmount, currency)} из ${formatMoney(value, currency)}`
              : value > 0
                ? `цель ${formatMoney(value, currency)}`
                : 'укажите сумму цели'}
          </small>
        </div>
      </div>

      <Field label="Название">
        <Input value={title} placeholder="Подушка безопасности" onChange={e => setTitle(e.target.value)} autoFocus />
      </Field>

      <Field label="Сумма цели">
        <AmountInput currency={currency} value={target} onChange={e => setTarget(e.target.value.replace(/[^\d]/g, ''))} />
      </Field>

      <Field label="Иконка">
        <ChipRow>
          {GOAL_EMOJIS.map(e => (
            <Chip key={e} active={icon === e} onClick={() => setIcon(e)} className="px-3 text-base">
              {e}
            </Chip>
          ))}
        </ChipRow>
      </Field>

      {editing && !editing.isPrimary && (
        <button
          onClick={() => {
            setPrimaryGoal(editing.id)
            showToast('Главная цель обновлена')
          }}
          className="mb-5 w-full rounded-xl bg-brand-soft py-3 text-xs font-bold text-brand transition hover:bg-brand hover:text-white"
        >
          Сделать главной целью
        </button>
      )}

      <div className="flex gap-2.5">
        {editing && (
          <Button
            variant="danger"
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true)
              deleteGoal(editing.id)
              showToast('Цель удалена')
              onClose()
            }}
          >
            <Trash2 className="size-4" strokeWidth={1.9} />
            {confirmDelete ? 'Точно удалить?' : 'Удалить'}
          </Button>
        )}
        <Button className="flex-1" disabled={!canSave} onClick={save}>
          Сохранить
        </Button>
      </div>
    </Sheet>
  )
}

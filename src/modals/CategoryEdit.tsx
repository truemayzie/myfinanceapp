import { useState } from 'react'
import { Check, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { AmountInput, Field, Input } from '../components/ui/Field'
import { SignRaw } from '../components/ui/Card'
import { Icon } from '../components/icons'
import { useApp } from '../AppContext'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../data/seed'
import { cn } from '../lib/cn'

export default function CategoryEdit({ onClose, editId }: { onClose: () => void; editId?: string | null }) {
  const { showToast } = useApp()
  const categories = useStore(s => s.categories)
  const currency = useStore(s => s.user.currency)
  const addCategory = useStore(s => s.addCategory)
  const updateCategory = useStore(s => s.updateCategory)
  const deleteCategory = useStore(s => s.deleteCategory)
  const editing = categories.find(c => c.id === editId)

  const [name, setName] = useState(editing?.name ?? '')
  const [icon, setIcon] = useState<string>(editing?.icon ?? CATEGORY_ICONS[0])
  const [color, setColor] = useState(editing?.color ?? CATEGORY_COLORS[0])
  const [limit, setLimit] = useState(editing?.monthlyLimit ? String(editing.monthlyLimit) : '')
  const [archived, setArchived] = useState(editing?.isArchived ?? false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = () => {
    if (!name.trim()) return
    const l = Math.max(0, parseInt(limit, 10) || 0)
    if (editing) {
      updateCategory(editing.id, { name: name.trim(), icon, color, monthlyLimit: l, isArchived: archived })
      showToast('Категория обновлена')
    } else {
      addCategory({ name: name.trim(), icon, color, monthlyLimit: l, sortOrder: categories.length, isArchived: false })
      showToast('Категория создана')
    }
    onClose()
  }

  return (
    <Sheet
      title={editing ? 'Категория' : 'Новая категория'}
      eyebrow={editing ? 'Редактирование' : 'Создание'}
      onClose={onClose}
    >
      <div className="mb-6 flex items-center gap-4 rounded-card bg-surface-2 p-4">
        <SignRaw color={color} size={52} className="rounded-2xl">
          <Icon name={icon} size={22} />
        </SignRaw>
        <div className="min-w-0">
          <b className="block truncate text-sm font-bold">{name.trim() || 'Без названия'}</b>
          <small className="num mt-0.5 block text-[11px] text-faint">
            {limit ? `лимит ${parseInt(limit, 10).toLocaleString('ru-RU')} ${currency}` : 'без лимита'}
          </small>
        </div>
      </div>

      <Field label="Название">
        <Input value={name} placeholder="Например, Спорт" onChange={e => setName(e.target.value)} autoFocus />
      </Field>

      <Field label="Иконка">
        <div className="grid grid-cols-6 gap-2">
          {CATEGORY_ICONS.map(n => (
            <button
              key={n}
              onClick={() => setIcon(n)}
              className={cn(
                'flex aspect-square items-center justify-center rounded-xl border transition',
                icon === n
                  ? 'border-brand bg-brand-soft text-brand'
                  : 'border-line bg-card text-muted hover:border-[#c9c6bd] hover:text-ink',
              )}
            >
              <Icon name={n} size={18} />
            </button>
          ))}
        </div>
      </Field>

      <Field label="Цвет">
        <div className="flex flex-wrap gap-2.5">
          {CATEGORY_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Цвет ${c}`}
              className={cn(
                'flex size-9 items-center justify-center rounded-xl transition',
                color === c ? 'ring-2 ring-ink/25 ring-offset-2 ring-offset-surface' : 'hover:scale-105',
              )}
              style={{ background: c, color: '#fff' }}
            >
              {color === c && <Check className="size-4" strokeWidth={2.6} />}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Лимит на период" hint="0 или пусто — без лимита">
        <AmountInput currency={currency} value={limit} onChange={e => setLimit(e.target.value.replace(/[^\d]/g, ''))} />
      </Field>

      {editing && (
        <label className="mb-5 flex cursor-pointer items-center gap-3 rounded-xl bg-surface-2 px-4 py-3">
          <input
            type="checkbox"
            checked={archived}
            onChange={e => setArchived(e.target.checked)}
            className="size-4 accent-[var(--color-brand)]"
          />
          <span className="text-xs font-semibold text-ink-soft">Скрыть категорию из списков</span>
        </label>
      )}

      <div className="flex gap-2.5">
        {editing && (
          <Button
            variant="danger"
            onClick={() => {
              if (!confirmDelete) return setConfirmDelete(true)
              deleteCategory(editing.id)
              showToast('Категория удалена')
              onClose()
            }}
          >
            <Trash2 className="size-4" strokeWidth={1.9} />
            {confirmDelete ? 'Точно удалить?' : 'Удалить'}
          </Button>
        )}
        <Button className="flex-1" disabled={!name.trim()} onClick={save}>
          Сохранить
        </Button>
      </div>
    </Sheet>
  )
}

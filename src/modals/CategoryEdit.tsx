import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { Icon } from '../components/icons'
import { useApp } from '../AppContext'
import { CATEGORY_ICONS } from '../data/seed'
import type { Category } from '../types'

const COLORS = ['#0E9F6E', '#B3402A', '#2563EB', '#6D28D9', '#C2660E', '#0891B2', '#57534E', '#4F46E5']

export default function CategoryEdit({ onClose, editId }: { onClose: () => void; editId?: string | null }) {
  const { showToast } = useApp()
  const categories = useStore(s => s.categories)
  const addCategory = useStore(s => s.addCategory)
  const updateCategory = useStore(s => s.updateCategory)
  const deleteCategory = useStore(s => s.deleteCategory)
  const editing = categories.find(c => c.id === editId)

  const [name, setName] = useState(editing?.name ?? '')
  const [icon, setIcon] = useState<string>(editing?.icon ?? CATEGORY_ICONS[0])
  const [color, setColor] = useState(editing?.color ?? COLORS[0])
  const [limit, setLimit] = useState(editing ? (editing.monthlyLimit || '').toString() : '')
  const [archived, setArchived] = useState(editing?.isArchived ?? false)

  const save = () => {
    if (!name.trim()) return
    const l = !limit ? 0 : Math.max(0, parseInt(limit, 10) || 0)
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
    <Sheet title={editing ? 'Категория' : 'Новая категория'} onClose={onClose}>
      <Field label="Название">
        <input className="input" value={name} placeholder="Например, Спорт" onChange={e => setName(e.target.value)} autoFocus />
      </Field>

      <Field label="Иконка">
        <div className="icon-grid">
          {CATEGORY_ICONS.map((n) => (
            <button key={n} className={`icon-cell ${icon === n ? 'active' : ''}`} onClick={() => setIcon(n)}>
              <Icon name={n} size={18} />
            </button>
          ))}
        </div>
      </Field>

      <Field label="Цвет">
        <div className="chip-row">
          {COLORS.map(c => (
            <button key={c} className={`swatch ${color === c ? 'active' : ''}`} style={{ background: c }} onClick={() => setColor(c)} />
          ))}
        </div>
      </Field>

      <Field label="Лимит на период (₽, 0 — без лимита)">
        <input className="input" type="tel" inputMode="numeric" value={limit} onChange={e => setLimit(e.target.value.replace(/[^\d]/g, ''))} />
      </Field>

      {editing && (
        <label className="check-row">
          <input type="checkbox" checked={archived} onChange={e => setArchived(e.target.checked)} />
          <span>Скрыть категорию</span>
        </label>
      )}

      <div className="sheet-actions">
        {editing && (
          <Button variant="danger" onClick={() => { deleteCategory(editing.id); showToast('Категория удалена'); onClose() }}>
            Удалить
          </Button>
        )}
        <Button variant="ink" onClick={save}>Сохранить</Button>
      </div>
    </Sheet>
  )
}
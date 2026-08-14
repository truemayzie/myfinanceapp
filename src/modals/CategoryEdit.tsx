import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Field } from '../components/ui/Field'
import { CATEGORY_EMOJIS, PALETTE } from '../data/seed'
import { haptic } from '../telegram'

export default function CategoryEdit({ onClose, editId }: { onClose: () => void; editId?: string }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore()
  const existing = categories.find(c => c.id === editId)
  const [name, setName] = useState(existing?.name ?? '')
  const [emoji, setEmoji] = useState(existing?.emoji ?? '📦')
  const [limit, setLimit] = useState(existing?.monthlyLimit ?? 0)
  const [color, setColor] = useState(existing?.color ?? PALETTE[0])

  const save = () => {
    if (!name.trim()) return
    const data = { name: name.trim(), emoji, monthlyLimit: Number(limit) || 0, color, sortOrder: categories.length, isArchived: false }
    if (existing) updateCategory(existing.id, data)
    else addCategory(data)
    haptic('success')
    onClose()
  }

  return (
    <Sheet title={existing ? 'Редактировать категорию' : 'Новая категория'} onClose={onClose}>
      <Field label="Эмодзи">
        <div className="chip-grid">
          {CATEGORY_EMOJIS.map(e => (
            <button key={e} className={`chip ${emoji === e ? 'on' : ''}`} onClick={() => setEmoji(e)}>{e}</button>
          ))}
        </div>
      </Field>
      <Field label="Название"><input value={name} onChange={e => setName(e.target.value)} /></Field>
      <Field label="Месячный лимит (0 — без лимита)">
        <input type="number" inputMode="decimal" value={limit} onChange={e => setLimit(Number(e.target.value))} />
      </Field>
      <Field label="Цвет">
        <div className="chip-grid">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ width: 34, height: 34, borderRadius: 10, background: c, border: color === c ? '3px solid var(--text)' : 'none' }}
              aria-label={c}
            />
          ))}
        </div>
      </Field>
      {existing ? (
        <div className="row" style={{ gap: 8 }}>
          <Button variant="danger" style={{ flex: 1 }} onClick={() => { if (confirm(`Удалить категорию «${existing.name}»?`)) { deleteCategory(existing.id); onClose() } }}>Удалить</Button>
          <Button style={{ flex: 1 }} onClick={save}>Сохранить</Button>
        </div>
      ) : (
        <Button onClick={save}>Создать</Button>
      )}
    </Sheet>
  )
}
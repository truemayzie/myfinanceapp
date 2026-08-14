import { useState } from 'react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { PALETTE } from '../data/seed'
import { haptic } from '../telegram'

const EMOJIS = ['🛒', '☕', '🚇', '🏠', '🎉', '💊', '📦', '👕', '💡', '📱', '🍔', '🐱']

export default function CategoryEdit({ onClose, editId }: { onClose: () => void; editId?: string }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore()
  const existing = categories.find(c => c.id === editId)
  const [name, setName] = useState(existing?.name ?? '')
  const [emoji, setEmoji] = useState(existing?.emoji ?? '📦')
  const [limit, setLimit] = useState(existing?.monthlyLimit ?? 0)
  const [color, setColor] = useState(existing?.color ?? PALETTE[0])

  const save = () => {
    if (!name.trim()) return
    const data = { name, emoji, monthlyLimit: Number(limit) || 0, color, sortOrder: categories.length, isArchived: false }
    if (existing) updateCategory(existing.id, data)
    else addCategory(data)
    haptic('success')
    onClose()
  }

  return (
    <Sheet title={existing ? 'Редактировать категорию' : 'Новая категория'} onClose={onClose}>
      <div className="field">
        <label>Эмодзи</label>
        <div className="chip-grid">
          {EMOJIS.map(e => <button key={e} className={`chip ${emoji === e ? 'on' : ''}`} onClick={() => setEmoji(e)}>{e}</button>)}
        </div>
      </div>
      <div className="field"><label>Название</label><input value={name} onChange={e => setName(e.target.value)} /></div>
      <div className="field"><label>Месячный лимит (0 — без лимита)</label><input type="number" value={limit} onChange={e => setLimit(Number(e.target.value))} /></div>
      <div className="field"><label>Цвет</label>
        <div className="chip-grid">
          {PALETTE.map(c => <button key={c} onClick={() => setColor(c)} style={{ width: 34, height: 34, borderRadius: 10, background: c, border: color === c ? '3px solid var(--text)' : 'none' }} />)}
        </div>
      </div>
      {existing ? (
        <div className="row" style={{ gap: 8 }}>
          <button className="danger-btn" style={{ flex: 1 }} onClick={() => { deleteCategory(existing.id); onClose() }}>Удалить</button>
          <button className="primary-btn" style={{ flex: 1 }} onClick={save}>Сохранить</button>
        </div>
      ) : (
        <button className="primary-btn" onClick={save}>Создать</button>
      )}
    </Sheet>
  )
}

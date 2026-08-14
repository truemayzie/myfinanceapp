import { useStore } from '../store/useStore'
import { useApp } from '../AppContext'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { formatMoney } from '../utils/finance'

export default function CategoryManager({ onClose }: { onClose: () => void }) {
  const { user, categories, deleteCategory } = useStore()
  const { openSheet, showToast } = useApp()
  const active = categories.filter(c => !c.isArchived).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <Sheet title="Категории" onClose={onClose}>
      <div className="sheet-body">
        {active.map(c => (
          <div className="cat-row" key={c.id}>
            <div className="cat-emoji" style={{ background: c.color + '33' }}>{c.emoji}</div>
            <div className="cat-info">
              <div className="cat-name">{c.name}</div>
              <div className="cat-sub">{c.monthlyLimit > 0 ? `лимит ${formatMoney(c.monthlyLimit, user.currency)}` : 'без лимита'}</div>
            </div>
            <button
              className="icon-btn"
              onClick={() => openSheet('category', { id: c.id })}
              aria-label="Редактировать"
              title="Редактировать"
            >✏️</button>
            <button
              className="icon-btn"
              onClick={() => {
                if (confirm(`Удалить категорию «${c.name}»?`)) { deleteCategory(c.id); showToast('Категория удалена') }
              }}
              aria-label="Удалить"
              title="Удалить"
            >🗑️</button>
          </div>
        ))}
        {active.length === 0 && <p className="muted center">Категорий пока нет</p>}
      </div>
      <Button variant="dashed" onClick={() => openSheet('category')} style={{ marginTop: 12 }}>+ Новая категория</Button>
    </Sheet>
  )
}

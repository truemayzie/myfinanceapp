import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Icon } from '../components/icons'
import { useApp } from '../AppContext'
import { iconOf } from '../data/seed'

export default function CategoryManager({ onClose }: { onClose: () => void }) {
  const { openSheet } = useApp()
  const categories = useStore(s => s.categories)

  return (
    <Sheet title="Категории" onClose={onClose}>
      <div className="list">
        {categories.map(c => (
          <button key={c.id} className="nav-row" onClick={() => openSheet('category', { id: c.id })}>
            <i className="sig" style={{ background: c.color }}><Icon name={iconOf(c) as any} size={16} /></i>
            <span className="row-main">
              <b>{c.name}</b>
              <small>{c.isArchived ? 'скрыта' : c.monthlyLimit ? `лимит ${c.monthlyLimit.toLocaleString('ru-RU')} ₽` : 'без лимита'}</small>
            </span>
            <Icon name="chevR" size={18} className="muted" />
          </button>
        ))}
      </div>
      <button className="btn btn-ink btn-block" onClick={() => openSheet('category')}>Добавить категорию</button>
    </Sheet>
  )
}
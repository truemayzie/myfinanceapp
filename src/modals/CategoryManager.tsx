import { ChevronRight, Plus } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Sheet } from '../components/Sheet'
import { Button } from '../components/ui/Button'
import { Badge, Row, Sign } from '../components/ui/Card'
import { useApp } from '../AppContext'
import { formatMoney } from '../utils/finance'

export default function CategoryManager({ onClose }: { onClose: () => void }) {
  const { openSheet } = useApp()
  const categories = useStore(s => s.categories)
  const currency = useStore(s => s.user.currency)

  const sorted = categories.slice().sort((a, b) => Number(a.isArchived) - Number(b.isArchived) || a.sortOrder - b.sortOrder)

  return (
    <Sheet title="Категории" eyebrow={`${categories.length} всего`} onClose={onClose}>
      <div className="overflow-hidden rounded-card border border-line bg-card">
        {sorted.map(c => (
          <Row as="button" key={c.id} onClick={() => openSheet('category', { id: c.id })}>
            <Sign cat={c} size={38} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <b className="truncate text-[13px] font-bold">{c.name}</b>
                {c.isArchived && <Badge tone="neutral">скрыта</Badge>}
              </span>
              <small className="num mt-0.5 block text-[11px] text-faint">
                {c.monthlyLimit > 0 ? `лимит ${formatMoney(c.monthlyLimit, currency)}` : 'без лимита'}
              </small>
            </span>
            <ChevronRight className="size-[18px] shrink-0 text-pale" strokeWidth={1.8} />
          </Row>
        ))}
      </div>

      <Button block className="mt-5" onClick={() => openSheet('category')}>
        <Plus className="size-4" strokeWidth={2.1} />
        Добавить категорию
      </Button>
    </Sheet>
  )
}

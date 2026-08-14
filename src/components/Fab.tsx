import { Icon } from './icons'

export default function Fab({ onClick }: { onClick: () => void }) {
  return (
    <button className="fab" onClick={onClick} aria-label="Добавить">
      <Icon name="plus" size={24} />
    </button>
  )
}
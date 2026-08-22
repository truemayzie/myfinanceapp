import { Plus } from 'lucide-react'

export default function Fab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Добавить"
      className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-5 z-20 flex size-14 items-center justify-center rounded-2xl bg-ink text-white shadow-fab transition hover:-translate-y-1 hover:bg-brand lg:bottom-8 lg:right-10"
    >
      <Plus className="size-6" strokeWidth={1.8} />
    </button>
  )
}

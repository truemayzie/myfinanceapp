import { ExternalLink, Smartphone } from 'lucide-react'
import { Sheet } from '../components/Sheet'

const BOT_LINK = 'https://t.me/MyFinance_TBank_Bot'

const STEPS = [
  'Откройте бота MyFinance по кнопке ниже',
  'Разрешите пересылку пушей Т-Банка в чат с ботом',
  'Списания начнут попадать в историю автоматически',
]

export default function TbankImport({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Импорт из банка" eyebrow="Т-Банк" onClose={onClose}>
      <div className="flex flex-col items-center rounded-card bg-surface-2 px-6 py-7 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-brand shadow-tile">
          <Smartphone className="size-6" strokeWidth={1.8} />
        </span>
        <h3 className="mt-4 text-sm font-bold">Пуши Т-Банка</h3>
        <p className="mt-1.5 max-w-[300px] text-xs leading-5 text-dim">
          Подключите бота и включите пересылку уведомлений о списаниях — операции будут попадать в приложение сами.
        </p>
      </div>

      <ol className="my-6 space-y-3">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-start gap-3">
            <span className="num flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-bold text-brand">
              {i + 1}
            </span>
            <span className="text-xs leading-5 text-ink-soft">{s}</span>
          </li>
        ))}
      </ol>

      <a
        href={BOT_LINK}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand"
      >
        Открыть бота
        <ExternalLink className="size-4" strokeWidth={1.9} />
      </a>

      <p className="mt-3 text-center text-[11px] text-pale">
        Категория подбирается по названию магазина из пуша.
      </p>
    </Sheet>
  )
}

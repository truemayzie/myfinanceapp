import { periodBounds } from '../../utils/finance'

const WEEKDAYS = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс']

/** Календарь трат: интенсивность зелёного = сумма за день */
export default function Heatmap({
  periodKey,
  periodStartDay,
  dayAmounts,
}: {
  periodKey: string
  periodStartDay: number
  dayAmounts: Record<number, number>
}) {
  const { start, end } = periodBounds(periodKey, periodStartDay)

  const cells: { day: number; amount: number }[] = []
  const cur = new Date(start)
  while (cur <= end) {
    const day = cur.getDate()
    cells.push({ day, amount: dayAmounts[day] ?? 0 })
    cur.setDate(cur.getDate() + 1)
  }

  // Пустые ячейки, чтобы первый день встал под свой день недели
  const offset = (start.getDay() + 6) % 7
  const max = Math.max(1, ...Object.values(dayAmounts))
  const today = new Date().getDate()

  return (
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map(d => (
          <span key={d} className="text-center text-[10px] font-bold text-pale">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: offset }, (_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {cells.map(({ day, amount }) => {
          const intensity = amount <= 0 ? 0 : 18 + (amount / max) * 82
          return (
            <div
              key={day}
              title={amount > 0 ? `${day}: ${amount.toLocaleString('ru-RU')} ₽` : `${day}: нет трат`}
              className={
                'num flex aspect-square items-center justify-center rounded-lg text-[10px] font-bold ' +
                (intensity > 55 ? 'text-white' : 'text-faint') +
                (day === today ? ' ring-2 ring-ink/25' : '')
              }
              style={{
                background:
                  amount > 0
                    ? `color-mix(in srgb, var(--color-brand) ${intensity}%, var(--color-surface-2))`
                    : 'var(--color-surface-2)',
              }}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

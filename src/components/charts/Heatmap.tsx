import { periodBounds } from '../../utils/finance'

export default function Heatmap({ periodKey, periodStartDay, dayAmounts }: {
  periodKey: string; periodStartDay: number; dayAmounts: Record<number, number>
}) {
  const { start, end } = periodBounds(periodKey, periodStartDay)
  const days: number[] = []
  const cur = new Date(start)
  while (cur <= end) {
    days.push(cur.getDate())
    cur.setDate(cur.getDate() + 1)
  }
  const max = Math.max(1, ...Object.values(dayAmounts))
  return (
    <div>
      <div className="heatmap">
        {days.map(d => {
          const v = dayAmounts[d] ?? 0
          const intensity = v <= 0 ? 0 : 0.18 + (v / max) * 0.82
          const bg = v > 0 ? `color-mix(in srgb, var(--primary) ${intensity * 100}%, var(--soft-track))` : 'var(--soft-track)'
          return (
            <div key={d} className="heat-cell" style={{ background: bg }} title={v > 0 ? `${v.toLocaleString('ru-RU')} ₽` : 'нет трат'}>
              {d}
            </div>
          )
        })}
      </div>
    </div>
  )
}

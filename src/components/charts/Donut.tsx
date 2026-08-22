export interface DonutSegment { value: number; color: string; label: string }

/** Кольцо долей: conic-gradient по сегментам, сумма в центре */
export default function Donut({ segments, size = 176 }: { segments: DonutSegment[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0)

  if (total <= 0) {
    return (
      <div
        className="mx-auto rounded-full bg-surface-2"
        style={{ width: size, height: size }}
      />
    )
  }

  let acc = 0
  const stops = segments
    .map(s => {
      const start = (acc / total) * 360
      acc += s.value
      return `${s.color} ${start}deg ${(acc / total) * 360}deg`
    })
    .join(', ')

  return (
    <div
      className="relative mx-auto rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(${stops})` }}
    >
      <div className="absolute inset-[23%] grid place-items-center rounded-full bg-card text-center shadow-card">
        <div>
          <p className="num text-lg font-bold tracking-[-0.04em]">{Math.round(total).toLocaleString('ru-RU')}</p>
          <p className="eyebrow mt-0.5">всего</p>
        </div>
      </div>
    </div>
  )
}

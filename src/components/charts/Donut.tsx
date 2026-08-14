export interface DonutSegment { value: number; color: string; label: string }

export default function Donut({ segments, size = 160 }: { segments: DonutSegment[]; size?: number }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  if (total <= 0) {
    return <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--track)', margin: '0 auto' }} />
  }
  let acc = 0
  const stops = segments.map(s => {
    const start = (acc / total) * 360
    acc += s.value
    const end = (acc / total) * 360
    return `${s.color} ${start}deg ${end}deg`
  }).join(', ')
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${stops})`, margin: '0 auto', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: '26%', background: 'var(--card)', borderRadius: '50%', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
        {Math.round(total).toLocaleString('ru-RU')}
      </div>
    </div>
  )
}

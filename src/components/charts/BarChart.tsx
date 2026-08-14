export interface BarItem { label: string; income: number; expense: number }

export default function BarChart({ data }: { data: BarItem[] }) {
  const max = Math.max(1, ...data.flatMap(d => [d.income, d.expense]))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 180, paddingTop: 10 }}>
      {data.map(d => (
        <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 150, width: '100%', justifyContent: 'center' }}>
            <div title={`Доход ${d.income}`} style={{ width: 10, background: 'var(--green)', borderRadius: 6, height: `${(d.income / max) * 150}px` }} />
            <div title={`Расход ${d.expense}`} style={{ width: 10, background: 'var(--accent)', borderRadius: 6, height: `${(d.expense / max) * 150}px` }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

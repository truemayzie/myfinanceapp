export interface BarItem { label: string; income: number; expense: number }

export default function BarChart({ data }: { data: BarItem[] }) {
  const max = Math.max(1, ...data.flatMap(d => [d.income, d.expense]))
  const fmt = (v: number) => {
    if (v >= 100000) return `${Math.round(v / 1000)}k`
    return String(Math.round(v))
  }
  return (
    <div>
      <div className="bars">
        {data.map(d => (
          <div className="bar-col" key={d.label} title={`${d.label}: доход ${fmt(d.income)}, расход ${fmt(d.expense)}`}>
            <div className="bar-pair">
              <i className="inc" style={{ height: `${(d.income / max) * 160}px` }} />
              <i className="exp" style={{ height: `${(d.expense / max) * 160}px` }} />
            </div>
            <span className="bar-label">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="axis"><span>0</span><span>{fmt(max / 2)}</span><span>{fmt(max)}</span></div>
      <div className="legend">
        <span className="lg-item"><i className="lg-cell" style={{ background: 'var(--income)' }} />Доход</span>
        <span className="lg-item"><i className="lg-cell" style={{ background: 'var(--primary)' }} />Расход</span>
      </div>
    </div>
  )
}
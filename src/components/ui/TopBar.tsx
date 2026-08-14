export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="topbar">
      <h1>{title}</h1>
      {subtitle && <div className="muted">{subtitle}</div>}
    </div>
  )
}

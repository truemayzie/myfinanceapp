import { SVGProps } from 'react'

const PATHS: Record<string, string> = {
  home: 'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9',
  pie: 'M12 3a9 9 0 1 0 9 9h-9V3zM14.5 3.4A9 9 0 0 1 20.6 9.5H14.5V3.4z',
  target: 'M12 3a9 9 0 1 0 9 9M12 8a4 4 0 1 0 4 4M12 3v5M12 16v5',
  bars: 'M4 19V13M10 19V5M16 19v-9M22 19H2',
  gear: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M19 5l-1.6 1.6M6.6 17.4 5 19M19 19l-1.6-1.6M6.6 6.6 5 5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  chevL: 'M15 5l-7 7 7 7',
  chevR: 'M9 5l7 7-7 7',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M4 12.5l5 5L20 6.5',
  trash: 'M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13M10 11v5M14 11v5',
  pencil: 'M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1z',
  download: 'M12 4v10m0 0 4-4m-4 4-4-4M5 20h14',
  upload: 'M12 16V6m0 0 4 4m-4-4-4 4M5 20h14',
  history: 'M3 12a9 9 0 1 0 2.6-6.4L3 8M3 3v5h5M12 8v4l3 2',
  arrowUp: 'M12 20V5m0 0-6 6m6-6 6 6',
  arrowDown: 'M12 4v15m0 0 6-6m-6 6-6-6',
  wallet: 'M3 7h14a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2V7zm3-3h13a1 1 0 0 1 1 1v2M16 14h3',
  card: 'M3 7h18v12H3V7zm0 4h18M6 15h4',
  cart: 'M3 4h2l2.4 11h10.2L21 7H6M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  cup: 'M5 8h11v5a4.5 4.5 0 0 1-9 0V8zm11 0h2a2 2 0 0 1 0 4h-2M8 3c-1 1 0 2-1 3M12 3c-1 1 0 2-1 3',
  train: 'M4 6c0-2 3.5-3 8-3s8 1 8 3v9c0 1.5-1 2.5-2.5 2.5l2 2M20 14H4M4 14v2M8 20h8M8 9h8M8 12h.01M16 12h.01',
  house: 'M4 11 12 4l8 7M6 9.5V20h12V9.5M10 20v-6h4v6',
  balloon: 'M12 3a6.5 6.5 0 0 1 6.5 6.5c0 3-2 4.5-3.5 5.5h-6C7.5 14 5.5 12.5 5.5 9.5A6.5 6.5 0 0 1 12 3zM9.5 16h5M10 20h4M12 15.5V18',
  health: 'M12 3 4 7v5c0 4.5 3 8 8 9 5-1 8-4.5 8-9V7l-8-4zM12 8v6M9 11h6',
  tag: 'M4 4h7l9 9-7 7-9-9V4zM8 8h.01',
  hanger: 'M12 7a2 2 0 1 1 2-2M4 18l16 0a1 1 0 0 0 .6-1.8L12 10M4 18a1 1 0 0 0 .6 1.8L12 15',
  bulb: 'M12 3a6 6 0 0 0-4 10.4c1 1 1.3 2 1.5 3.1h5c.2-1.1.5-2.1 1.5-3.1A6 6 0 0 0 12 3zM10 20h4M11 17v3M13 17v3',
  phone: 'M7 3h10v18H7V3zm2 6h6M9 15h6',
  burger: 'M4 8h16M4 8a8 8 0 0 0 16 0M4 8v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8M12 12h.01M8 12h.01M16 12h.01',
  calendar: 'M4 6h16v14H4V6zM8 3v4M16 3v4M4 10h16',
  spark: 'M12 3l2 5.5L19.5 10 14 12.5 12 18l-2-5.5L4.5 10 10 8.5 12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z',
  alert: 'M12 4 2.5 20h19L12 4zM12 9v5M12 17h.01',
  mail: 'M4 6h16v12H4V6zm0 1 8 6 8-6',
  palette: 'M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 1.4-3.4A2 2 0 0 1 17 15h2a2 2 0 0 0 2-2v-1A9 9 0 0 0 12 3zM7.5 12h.01M9.5 7.5h.01M14.5 7.5h.01M16.5 12h.01',
  coins: 'M12 7c-4.4 0-8-1.6-8-3.5S7.6 0 12 0s8 1.6 8 3.5S16.4 7 12 7zM4 3.5V7c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5V3.5M4 10.5V14c0 1.9 3.6 3.5 8 3.5s8-1.6 8-3.5v-3.5',
  clock: 'M12 3a9 9 0 1 0 9 9M12 3v9h6',
  trend: 'M4 16l5-5 3 3 7-8M19 6h-3M19 6v3',
  sparkle: 'M12 2l2.5 6 6 2.5-6 2.5L12 19.5 9.5 13.5l-6-2.5 6-2.5L12 2z',
  switch: 'M4 8h13m0 0-3-3m3 3-3 3M20 16H7m0 0 3-3m-3 3 3 3',
  export: 'M12 3v11m0 0 4-4m-4 4-4-4M5 20h14',
  question: 'M12 3a9 9 0 1 0 9 9M12 8v1M12 12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2M12 17h.01',
}

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 22, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d={PATHS[name] ?? PATHS.tag} />
    </svg>
  )
}

export const ICON_NAMES = Object.keys(PATHS) as IconName[]
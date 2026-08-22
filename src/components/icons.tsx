import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  BusFront,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  Coffee,
  Coins,
  CreditCard,
  Download,
  HeartPulse,
  History,
  Home,
  House,
  Lightbulb,
  Mail,
  Minus,
  Palette,
  Pencil,
  PieChart,
  Plus,
  Settings,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tag,
  Target,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Upload,
  Utensils,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { ComponentProps } from 'react'

/**
 * Имена иконок — часть данных: `Category.icon` хранит эти строки в БД.
 * Поэтому ключи менять нельзя, меняется только отрисовка (теперь lucide).
 */
const ICONS: Record<string, LucideIcon> = {
  // Навигация и действия
  home: Home,
  pie: PieChart,
  target: Target,
  bars: BarChart3,
  gear: Settings,
  plus: Plus,
  minus: Minus,
  chevL: ChevronLeft,
  chevR: ChevronRight,
  close: X,
  check: Check,
  trash: Trash2,
  pencil: Pencil,
  download: Download,
  upload: Upload,
  export: Download,
  history: History,
  switch: ArrowLeftRight,
  question: CircleHelp,
  alert: TriangleAlert,
  mail: Mail,
  palette: Palette,
  calendar: CalendarDays,
  clock: Clock,
  trend: TrendingUp,
  arrowUp: ArrowUpRight,
  arrowDown: ArrowDownLeft,
  wallet: WalletCards,
  card: CreditCard,

  // Категории расходов
  cart: ShoppingBag,
  cup: Coffee,
  train: BusFront,
  house: House,
  balloon: Sparkles,
  health: HeartPulse,
  tag: Tag,
  hanger: Shirt,
  bulb: Lightbulb,
  phone: Smartphone,
  burger: Utensils,
  coins: Coins,
  spark: Sparkles,
  sparkle: Sparkles,
}

export type IconName = keyof typeof ICONS

export function Icon({
  name,
  size = 22,
  strokeWidth = 1.8,
  ...props
}: { name: IconName; size?: number } & Omit<ComponentProps<LucideIcon>, 'ref'>) {
  const Cmp = ICONS[name] ?? Tag
  return <Cmp size={size} strokeWidth={strokeWidth} {...props} />
}

/** Компонент иконки по имени — когда нужен сам элемент, а не готовый <Icon> */
export function iconComponent(name: string): LucideIcon {
  return ICONS[name] ?? Tag
}

export const ICON_NAMES = Object.keys(ICONS) as IconName[]

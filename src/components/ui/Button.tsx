import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'ink' | 'ghost' | 'danger' | 'soft' | 'onDark'

const VARIANTS: Record<Variant, string> = {
  // Основная кнопка макета — чернильная, на ховере зеленеет
  primary: 'bg-ink text-white hover:bg-brand',
  ink: 'bg-ink text-white hover:bg-brand',
  ghost: 'border border-line bg-card text-ink-soft hover:border-[#c9c6bd] hover:text-ink',
  danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-white',
  soft: 'bg-brand-soft text-brand hover:bg-brand hover:text-white',
  // Для тёмной карты: светлая плашка на чернильном фоне
  onDark: 'bg-[#f4f3ee] text-ink hover:bg-[#d9f0e4]',
}

export function Button({
  variant = 'primary',
  size,
  block,
  className,
  children,
  ...props
}: {
  variant?: Variant
  size?: 'sm'
  block?: boolean
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition',
        'disabled:cursor-not-allowed disabled:opacity-45',
        size === 'sm' ? 'px-3.5 py-2.5 text-xs' : 'px-5 py-3.5 text-sm',
        block && 'w-full',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

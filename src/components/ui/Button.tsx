import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ink' | 'ghost' | 'danger' | 'soft'

export function Button({
  variant = 'primary',
  size,
  block,
  className = '',
  children,
  ...props
}: {
  variant?: Variant
  size?: 'sm'
  block?: boolean
  className?: string
  children: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = ['btn', `btn-${variant}`, size ? `btn-${size}` : '', block ? 'btn-block' : '', className].filter(Boolean).join(' ')
  return (
    <button className={cls} {...props}>
      {children}
    </button>
  )
}

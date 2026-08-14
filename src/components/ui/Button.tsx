import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'dashed'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: { variant?: Variant; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`${variant}-btn ${className}`} {...props} />
}

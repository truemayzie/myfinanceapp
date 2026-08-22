import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="mb-4 block last:mb-0">
      <span className="mb-1.5 block text-xs font-bold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-dim">{hint}</span>}
    </label>
  )
}

const FIELD_BASE =
  'w-full rounded-xl border border-line-input bg-card px-4 py-3 text-sm outline-none transition placeholder:text-pale focus:border-brand focus:ring-2 focus:ring-brand/10'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD_BASE, className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD_BASE, 'resize-none leading-5', className)} {...props} />
}

/** Крупный ввод суммы с приклеенным символом валюты */
export function AmountInput({
  currency = '₽',
  className,
  ...props
}: { currency?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <input
        type="tel"
        inputMode="numeric"
        placeholder="0"
        className={cn(
          'num w-full rounded-xl border border-line-input bg-card px-4 py-3 text-xl font-bold outline-none transition',
          'placeholder:text-[#c5c3ba] focus:border-brand focus:ring-2 focus:ring-brand/10',
          className,
        )}
        {...props}
      />
      <span className="absolute right-4 top-3.5 text-sm font-bold text-dim">{currency}</span>
    </div>
  )
}

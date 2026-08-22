/** Русское склонение по числу: 1 день, 2 дня, 5 дней */
export function plural(n: number, one: string, two: string, five: string): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return two
  return five
}

export function days(n: number): string {
  return `${n} ${plural(n, 'день', 'дня', 'дней')}`
}

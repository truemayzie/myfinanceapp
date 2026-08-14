import type { Category, Operation } from '../types'

// Пример пуша Т-Банка:
// "Покупка. Карта *1234. Списано 540 ₽. Доступно 12 345 ₽. Пятёрочка"
// или "Списание 1 230 ₽. Магнит. Остаток ..."
const AMOUNT_RE = /(?:списано|списание|сумма|оплата)\s*[:]?\s*([\d\s]+[.,]?\d*)\s*(?:₽|руб)/i
const MERCHANT_RE = /(?:остаток|доступно|баланс).{0,40}?([А-Яа-яЁёA-Za-z0-9\s&\-]{2,40})$/i

export interface ParsedPush {
  amount: number
  merchant: string | null
}

export function parseTbankPush(text: string): ParsedPush | null {
  const m = text.match(AMOUNT_RE)
  if (!m) return null
  const num = Number(m[1].replace(/\s/g, '').replace(',', '.'))
  if (!Number.isFinite(num) || num <= 0) return null
  const mer = text.match(MERCHANT_RE)
  let merchant: string | null = null
  if (mer) {
    merchant = mer[1].trim().replace(/\.$/, '')
  }
  return { amount: num, merchant }
}

export function matchCategoryByMerchant(merchant: string | null, categories: Category[]): string | null {
  if (!merchant) return null
  const lower = merchant.toLowerCase()
  const known: Record<string, string[]> = {
    'Продукты': ['пятёрочка', 'пятерочка', 'магнит', 'перекрёсток', 'перекресток', 'лавка', 'вкусвилл', 'lenta', 'ашан'],
    'Кафе и рестораны': ['кофе', 'кафе', 'ресторан', 'бургер', 'пицца', 'kfc', 'mcdonald', 'старбакс', 'starbucks'],
    'Транспорт': ['метро', 'метрополитен', 'автобус', 'такси', 'яндекс', 'uber', 'каршер'],
    'Жильё': ['жкх', 'дом', 'кварт', 'электро', 'вода', 'газ'],
  }
  for (const [catName, keys] of Object.entries(known)) {
    if (keys.some(k => lower.includes(k))) {
      const cat = categories.find(c => c.name === catName)
      if (cat) return cat.id
    }
  }
  return null
}

export function buildOperationFromPush(text: string, categories: Category[]): Omit<Operation, 'id' | 'createdAt' | 'date'> | null {
  const parsed = parseTbankPush(text)
  if (!parsed) return null
  const categoryId = matchCategoryByMerchant(parsed.merchant, categories)
  return {
    type: 'expense',
    amount: parsed.amount,
    categoryId,
    goalId: null,
    comment: parsed.merchant ?? 'Из пуша Т-Банка',
    source: 'tbank_push',
  }
}

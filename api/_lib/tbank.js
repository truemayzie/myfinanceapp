// Копия логики src/utils/tbank.ts для серверных функций (чтобы не тянуть TS в Vercel).
const AMOUNT_RE = /(?:списано|списание|сумма|оплата)\s*[:]?\s*([\d\s]+[.,]?\d*)\s*(?:₽|руб)/i
const MERCHANT_RE = /(?:остаток|доступно|баланс).{0,40}?([А-Яа-яЁёA-Za-z0-9\s&\-]{2,40})$/i

function parseTbankPush(text) {
  const m = text.match(AMOUNT_RE)
  if (!m) return null
  const num = Number(m[1].replace(/\s/g, '').replace(',', '.'))
  if (!Number.isFinite(num) || num <= 0) return null
  const mer = text.match(MERCHANT_RE)
  let merchant = null
  if (mer) merchant = mer[1].trim().replace(/\.$/, '')
  return { amount: num, merchant }
}

function matchCategoryByMerchant(merchant, categories) {
  if (!merchant) return null
  const lower = merchant.toLowerCase()
  const known = {
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

function buildOperationFromPush(text, categories) {
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

module.exports = { buildOperationFromPush }
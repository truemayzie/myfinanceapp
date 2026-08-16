const { getSupabase } = require('./_lib/supabase')
const { buildOperationFromPush } = require('./_lib/tbank')
const { DEFAULT_CATEGORIES, uid } = require('./_lib/seed')

const TG_API = 'https://api.telegram.org/bot'

async function callTelegram(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const r = await fetch(`${TG_API}${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return r.json()
}

function defaultState(name) {
  return {
    user: { id: 'local', telegramId: null, name, currency: '₽', periodStartDay: 1, theme: 'lavender', onboarded: true, monthResetAt: null },
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c, id: uid() })),
    operations: [],
    goals: [],
    plans: [],
    tickets: [],
  }
}

module.exports = async function handler(req, res) {
  try {
    return await run(req, res)
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) })
  }
}

async function run(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'post only' })

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (secret && req.headers['x-telegram-bot-api-secret-token'] !== secret) {
    return res.status(401).json({ error: 'bad secret' })
  }

  const update = req.body
  const msg = update?.message
  if (!msg?.from) return res.status(200).json({ ok: true })

  const tid = String(msg.from.id)
  const name = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ') || msg.from.username || 'Друг'
  const text = msg.text || ''

  if (text.startsWith('/start')) {
    const webApp = process.env.TELEGRAM_WEBAPP_URL
    await callTelegram('sendMessage', {
      chat_id: tid,
      text: 'Привет! Открой Mini App для учёта финансов. Чтобы траты из Т-Банка подтягивались сами — просто перешли сюда push-уведомление о списании.',
      reply_markup: webApp
        ? { inline_keyboard: [[{ text: 'Открыть Финансы', web_app: { url: webApp } }]] }
        : undefined,
    })
    return res.status(200).json({ ok: true })
  }

  const supabase = getSupabase()
  const { data } = await supabase.from('finance_state').select('data').eq('telegram_id', tid).maybeSingle()
  let state = data?.data || null

  const cats = state?.categories?.length ? state.categories : defaultState(name).categories
  const parsed = buildOperationFromPush(text, cats)
  if (!parsed) {
    await callTelegram('sendMessage', { chat_id: tid, text: 'Не понял сообщение. Перешли пуш Т-Банка о списании или нажми «Открыть Финансы».' })
    return res.status(200).json({ ok: true })
  }

  if (!state) state = defaultState(name)
  if (!state.operations) state.operations = []
  if (!state.categories) state.categories = defaultState(name).categories

  const op = { ...parsed, id: uid(), createdAt: Date.now(), date: new Date().toISOString().slice(0, 10) }
  state.operations.push(op)
  state.user = { ...state.user, name, telegramId: Number(tid), onboarded: true }

  const { error } = await supabase.from('finance_state').upsert(
    { telegram_id: tid, data: state, updated_at: new Date().toISOString() },
    { onConflict: 'telegram_id' },
  )
  if (error) {
    await callTelegram('sendMessage', { chat_id: tid, text: 'Не удалось сохранить: ' + error.message })
    return res.status(200).json({ ok: true })
  }

  const cat = state.categories.find(c => c.id === op.categoryId)
  await callTelegram('sendMessage', {
    chat_id: tid,
    text: `✅ Трата добавлена: ${op.amount.toLocaleString('ru-RU')} ₽${cat ? ` · ${cat.emoji} ${cat.name}` : ''}. Открой Mini App, чтобы увидеть её в бюджете.`,
  })
  return res.status(200).json({ ok: true })
}
const { verifyInitData, extractInitData } = require('./_lib/telegram')
const { getSupabase } = require('./_lib/supabase')

module.exports = async function handler(req, res) {
  try {
    return await run(req, res)
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) })
  }
}

async function run(req, res) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return res.status(500).json({ error: 'server misconfigured' })

  const initData = extractInitData(req)
  if (!initData) return res.status(401).json({ error: 'missing auth' })
  const user = verifyInitData(initData, botToken)
  if (!user) return res.status(403).json({ error: 'bad initData' })

  const supabase = getSupabase()
  const tid = String(user.id)

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('finance_state').select('data').eq('telegram_id', tid).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ state: data?.data ?? null })
  }

  if (req.method === 'POST') {
    const incoming = req.body?.state
    if (!incoming || !incoming.user) return res.status(400).json({ error: 'bad payload' })

    // Сливаем операции: сохраняем и локальные, и добавленные ботом (по id).
    const { data: existing } = await supabase.from('finance_state').select('data').eq('telegram_id', tid).maybeSingle()
    const remote = existing?.data || null
    if (remote?.operations?.length) {
      const ids = new Set((incoming.operations || []).map(o => o.id))
      const merged = [...(incoming.operations || []), ...remote.operations.filter(o => !ids.has(o.id))]
      incoming.operations = merged
    }

    const { error } = await supabase.from('finance_state').upsert(
      { telegram_id: tid, data: incoming, updated_at: new Date().toISOString() },
      { onConflict: 'telegram_id' },
    )
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'method not allowed' })
}
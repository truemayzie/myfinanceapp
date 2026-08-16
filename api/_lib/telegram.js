const crypto = require('crypto')

/**
 * Проверка подписи initData по алгоритму Telegram Web App.
 * Хэш всегда считается по *сырой* строке запроса (до URL-декодирования),
 * поэтому value итерируются как есть.
 */
function verifyInitData(initData, botToken) {
  try {
    if (!initData || !botToken) return null
    const parts = initData.split('&').filter(Boolean)
    const hashPair = parts.find(p => p.startsWith('hash='))
    if (!hashPair) return null
    const rawHash = hashPair.split('=').slice(1).join('=')

    const dataCheck = parts
      .filter(p => !p.startsWith('hash='))
      .map(kv => kv.split('='))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')

    const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest()
    let computed = crypto.createHmac('sha256', secret).update(dataCheck).digest('hex')
    if (computed !== rawHash) {
      // Запасной вариант: Telegram мог прислать raw-JSON без URL-кодирования.
      const decoded = parts
        .filter(p => !p.startsWith('hash='))
        .map(kv => [kv.split('=')[0], kv.split('=').slice(1).join('=')])
        .map(([k, v]) => [k, decodeURIComponent(v)])
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('\n')
      computed = crypto.createHmac('sha256', secret).update(decoded).digest('hex')
      if (computed !== rawHash) return null
    }

    const authDate = Number(new URLSearchParams(initData).get('auth_date') || '0')
    if (authDate && Date.now() / 1000 - authDate > 86400) return null

    const userPair = parts.find(p => p.startsWith('user='))
    const userRaw = userPair ? decodeURIComponent(userPair.split('=').slice(1).join('=')) : '{}'
    const user = JSON.parse(userRaw)
    return { id: Number(user.id), first_name: user.first_name, last_name: user.last_name, username: user.username }
  } catch {
    return null
  }
}

function extractInitData(req) {
  const auth = req.headers['authorization'] || ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

module.exports = { verifyInitData, extractInitData }
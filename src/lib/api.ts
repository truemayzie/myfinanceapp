const BASE = import.meta.env.VITE_API_BASE || '/api'

export async function getState(initData: string): Promise<{ state: any } | null> {
  try {
    const r = await fetch(`${BASE}/state`, { headers: { Authorization: `Bearer ${initData}` } })
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  }
}

export async function saveState(initData: string, state: any): Promise<void> {
  try {
    await fetch(`${BASE}/state`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: `Bearer ${initData}` },
      body: JSON.stringify({ state }),
    })
  } catch {
    /* offline — localStorage сохранит локально */
  }
}

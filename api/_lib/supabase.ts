import { createClient } from '@supabase/supabase-js'

let client: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set')
  if (!client) client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

export interface StateDoc {
  user: any
  categories: any[]
  operations: any[]
  goals: any[]
  plans: any[]
  tickets: any[]
}

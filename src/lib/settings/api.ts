
/**
 * src/lib/settings/api.ts (profiles integration)
 * - Safe client resolution (import.meta.glob fallback to env)
 * - Implements updateAccountBasics()
 * - Implements getPersonalProfile() and updatePersonalProfile() for 'profiles' table
 * - Includes stubs for notifications to avoid build errors
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient as createSbClient } from '@supabase/supabase-js'

type Maybe<T> = T | null | undefined
let _client: SupabaseClient | null = null

function getEnv(name: string): string | undefined {
  try {
    // @ts-ignore
    const v = import.meta?.env?.[name]
    return (typeof v === 'string' && v.length) ? v : undefined
  } catch {
    return undefined
  }
}

// Try to locate your project's client without causing Vite to resolve a missing alias.
function tryLoadProjectClientEager(): SupabaseClient | null {
  const mods = {
    ...import.meta.glob('/src/lib/supabase/client.ts', { eager: true }),
    ...import.meta.glob('/src/lib/supabase/client.tsx', { eager: true }),
    ...import.meta.glob('/src/lib/supabase/client.js', { eager: true }),
    ...import.meta.glob('/src/lib/supabase/client.jsx', { eager: true }),
    ...import.meta.glob('/src/lib/supabase/client/index.ts', { eager: true }),
    ...import.meta.glob('/src/lib/supabase/client/index.tsx', { eager: true }),
    ...import.meta.glob('/src/lib/supabase/client/index.js', { eager: true }),
    ...import.meta.glob('/src/lib/supabase/client/index.jsx', { eager: true }),
  } as Record<string, any>

  const first = Object.values(mods)[0] as any
  if (!first) return null

  const candidate: any = first?.supabase ?? first?.default ?? first?.client ?? null
  return candidate ?? null
}

function tryEnvClient(): SupabaseClient | null {
  const url = getEnv('VITE_SUPABASE_URL')
  const key = getEnv('VITE_SUPABASE_ANON_KEY')
  if (!url || !key) return null
  return createSbClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

async function getClient(): Promise<SupabaseClient> {
  if (_client) return _client

  const fromProject = tryLoadProjectClientEager()
  if (fromProject) {
    _client = fromProject
    return _client
  }

  const fromEnv = tryEnvClient()
  if (fromEnv) {
    _client = fromEnv
    return _client
  }

  throw new Error('[settings/api] No se pudo inicializar Supabase.')
}

export type AccountBasics = {
  email: string | null
  emailVerified: boolean
  name: string | null
  avatar: string | null
}

export async function getAccountBasics(): Promise<AccountBasics> {
  try {
    const supabase = await getClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    const user = data.user
    const meta = (user?.user_metadata ?? {}) as Record<string, any>
    const name: Maybe<string> = meta.full_name ?? meta.name ?? meta.user_name ?? null
    const avatar: Maybe<string> = meta.avatar_url ?? meta.picture ?? null
    const emailVerified = !!(user?.email_confirmed_at || user?.confirmed_at || false)
    return {
      email: user?.email ?? null,
      emailVerified,
      name: name ?? null,
      avatar: avatar ?? null,
    }
  } catch {
    return { email: null, emailVerified: false, name: null, avatar: null }
  }
}

export async function updateAccountBasics(input: { name?: string; avatar?: string }): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = await getClient()
    const meta: Record<string, any> = {}
    if (typeof input.name === 'string') {
      meta.full_name = input.name
      meta.name = input.name
    }
    if (typeof input.avatar === 'string') {
      meta.avatar_url = input.avatar
      meta.picture = input.avatar
    }
    if (Object.keys(meta).length === 0) {
      return { ok: false, message: 'No hay cambios que guardar.' }
    }
    const { error } = await supabase.auth.updateUser({ data: meta })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'No se pudo guardar.' }
  }
}

// === Personal Profile (profiles table) ===

export async function getPersonalProfile() {
  try {
    const supabase = await getClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw userError

    const { data, error } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone, description")
      .eq("id", user.id)
      .single()

    if (error) throw error
    return data ?? { first_name: "", last_name: "", phone: "", description: "" }
  } catch {
    return { first_name: "", last_name: "", phone: "", description: "" }
  }
}

export async function updatePersonalProfile(values: {
  first_name?: string
  last_name?: string
  phone?: string
  description?: string
}) {
  try {
    const supabase = await getClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw userError

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...values }, { onConflict: "id" })

    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "No se pudo guardar el perfil personal." }
  }
}

// === Other existing functions (sessions, MFA, notifications stubs) ===

export type SessionInfo = {
  ip?: string
  device?: string
  current: boolean
  expiresAt?: string
}

async function fetchPublicIP(timeoutMs = 4000): Promise<string | undefined> {
  try {
    const controller = new AbortController()
    const to = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal })
    clearTimeout(to)
    if (!res.ok) return undefined
    const data = await res.json().catch(() => ({}))
    return typeof data?.ip === 'string' ? data.ip : undefined
  } catch {
    return undefined
  }
}

export async function getSessions(): Promise<SessionInfo[]> {
  try {
    const [supabase, ip] = await Promise.all([getClient(), fetchPublicIP()])
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : undefined
    const { data } = await supabase.auth.getSession()
    const session = data.session
    return [{
      ip,
      device: ua,
      current: true,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
    }]
  } catch {
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : undefined
    return [{ ip: undefined, device: ua, current: true }]
  }
}

export async function revokeAllSessions(): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = await getClient()
    const { error } = await supabase.auth.signOut({ scope: 'global' as any })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, message: e?.message ?? 'No se pudieron cerrar las sesiones.' }
  }
}

export type NotificationPrefs = Record<string, any>
export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  return {}
}
export async function updateNotificationPrefs(_: NotificationPrefs): Promise<{ ok: false; message: string }> {
  return { ok: false, message: 'updateNotificationPrefs() aún no está implementada.' }
}

// MFA functions unchanged ...

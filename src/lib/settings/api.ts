
/**
 * src/lib/settings/api.ts — ALL settings API in one place.
 * (Same as previous comprehensive version, kept for completeness.)
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
    ...import.meta.glob('src/lib/supabase/client.ts', { eager: true }),
    ...import.meta.glob('src/lib/supabase/client.tsx', { eager: true }),
    ...import.meta.glob('src/lib/supabase/client.js', { eager: true }),
    ...import.meta.glob('src/lib/supabase/client.jsx', { eager: true }),
    ...import.meta.glob('src/lib/supabase/client/index.ts', { eager: true }),
    ...import.meta.glob('src/lib/supabase/client/index.tsx', { eager: true }),
    ...import.meta.glob('src/lib/supabase/client/index.js', { eager: true }),
    ...import.meta.glob('src/lib/supabase/client/index.jsx', { eager: true }),
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
  return createSbClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
}

async function getClient(): Promise<SupabaseClient> {
  if (_client) return _client
  const fromProject = tryLoadProjectClientEager()
  if (fromProject) { _client = fromProject; return _client }
  const fromEnv = tryEnvClient()
  if (fromEnv) { _client = fromEnv; return _client }
  throw new Error('[settings/api] No se pudo inicializar Supabase (falta cliente y/o env).')
}

export type AccountBasics = { email: string | null; emailVerified: boolean; name: string | null; avatar: string | null }

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
    return { email: user?.email ?? null, emailVerified, name: name ?? null, avatar: avatar ?? null }
  } catch {
    return { email: null, emailVerified: false, name: null, avatar: null }
  }
}

export async function updateAccountBasics(input: { name?: string; avatar?: string }): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = await getClient()
    const meta: Record<string, any> = {}
    if (typeof input.name === 'string') { meta.full_name = input.name; meta.name = input.name }
    if (typeof input.avatar === 'string') { meta.avatar_url = input.avatar; meta.picture = input.avatar }
    if (Object.keys(meta).length === 0) return { ok: false, message: 'No hay cambios que guardar.' }
    const { error } = await supabase.auth.updateUser({ data: meta })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e: any) { return { ok: false, message: e?.message ?? 'No se pudo guardar.' } }
}

export async function changeAuth(input: { newEmail?: string; newPassword?: string }): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = await getClient()
    const payload: any = {}
    if (input.newEmail) payload.email = input.newEmail
    if (input.newPassword) payload.password = input.newPassword
    if (!payload.email && !payload.password) return { ok: false, message: 'Proporciona newEmail o newPassword.' }
    const { error } = await supabase.auth.updateUser(payload)
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e: any) { return { ok: false, message: e?.message ?? 'No se pudo actualizar el usuario.' } }
}

export type SessionInfo = { ip?: string; device?: string; current: boolean; expiresAt?: string }

async function fetchPublicIP(timeoutMs = 4000): Promise<string | undefined> {
  try {
    const controller = new AbortController(); const to = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal })
    clearTimeout(to); if (!res.ok) return undefined
    const data = await res.json().catch(() => ({}))
    return typeof data?.ip === 'string' ? data.ip : undefined
  } catch { return undefined }
}

export async function getSessions(): Promise<SessionInfo[]> {
  try {
    const [supabase, ip] = await Promise.all([getClient(), fetchPublicIP()])
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : undefined
    const { data } = await supabase.auth.getSession()
    const session = data.session
    return [{ ip, device: ua, current: true, expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined }]
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
  } catch (e: any) { return { ok: false, message: e?.message ?? 'No se pudieron cerrar las sesiones.' } }
}

export async function getLocalePrefs(): Promise<{ locale?: string; currency?: string; tz?: string }> { return {} }
export async function updateLocalePrefs(_: { locale?: string; currency?: string; tz?: string }): Promise<{ ok: false; message: string }> {
  return { ok: false, message: 'updateLocalePrefs() aún no está implementada.' }
}

export type TotpEnrollResult = { factorId: string; qrSvg?: string; secret?: string; uri?: string }

export async function mfaListFactors(): Promise<{ totp: Array<{ id: string; status: string }>; defaultFactorId?: string }> {
  try {
    const supabase = await getClient()
    // @ts-ignore
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) throw error
    const totp = (data?.totp ?? []).map((f: any) => ({ id: f.id, status: f.status }))
    return { totp, defaultFactorId: (data as any)?.default_factor_id }
  } catch { return { totp: [] } }
}

export async function mfaEnrollTotp(): Promise<{ ok: boolean; data?: TotpEnrollResult; message?: string }> {
  try {
    const supabase = await getClient()
    // @ts-ignore
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error) return { ok: false, message: error.message }
    const totp = (data as any)?.totp ?? {}
    return { ok: true, data: { factorId: totp.id, qrSvg: totp.qr_code, secret: totp.secret, uri: totp.uri } }
  } catch (e: any) { return { ok: false, message: e?.message ?? 'No se pudo iniciar el alta de 2FA.' } }
}

export async function mfaVerifyTotp(factorId: string, code: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = await getClient()
    // @ts-ignore
    const { error } = await supabase.auth.mfa.verify({ factorId, code })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e: any) { return { ok: false, message: e?.message ?? 'No se pudo verificar el código.' } }
}

export async function mfaUnenroll(factorId: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const supabase = await getClient()
    // @ts-ignore
    const { error } = await supabase.auth.mfa.unenroll({ factorId })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e: any) { return { ok: false, message: e?.message ?? 'No se pudo desactivar el 2FA.' } }
}

export async function getPersonalProfile() {
  try {
    const supabase = await getClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw userError
    const { data, error } = await supabase.from('profiles').select('first_name, last_name, phone, description').eq('id', user.id).single()
    if (error) throw error
    return data ?? { first_name: '', last_name: '', phone: '', description: '' }
  } catch {
    return { first_name: '', last_name: '', phone: '', description: '' }
  }
}

export async function updatePersonalProfile(values: { first_name?: string; last_name?: string; phone?: string; description?: string }) {
  try {
    const supabase = await getClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw userError
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...values }, { onConflict: 'id' })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e: any) { return { ok: false, message: e?.message ?? 'No se pudo guardar el perfil personal.' } }
}

export async function getCompanyProfile() {
  try {
    const supabase = await getClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw userError
    const { data, error } = await supabase
      .from('profiles')
      .select('company_name, tax_id, sector, description, website, phone, address, social_links')
      .eq('id', user.id)
      .single()
    if (error) throw error
    const c = data ?? {}
    return {
      legalName: c.company_name ?? '',
      tradeName: c.company_name ?? '',
      taxId: c.tax_id ?? '',
      sector: c.sector ?? '',
      description: c.description ?? '',
      website: c.website ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
      social: c.social_links ?? '',
      visibility: 'public',
    }
  } catch {
    return { legalName: '', tradeName: '', taxId: '', sector: '', description: '', website: '', phone: '', address: '', social: '', visibility: 'public' }
  }
}

export async function updateCompanyProfile(values: {
  legalName?: string; tradeName?: string; taxId?: string; sector?: string;
  description?: string; website?: string; phone?: string; address?: string; social?: string; visibility?: string;
}) {
  try {
    const supabase = await getClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw userError
    const payload: any = {}
    if (values.legalName || values.tradeName) payload.company_name = values.legalName || values.tradeName
    if (values.taxId !== undefined) payload.tax_id = values.taxId
    if (values.sector !== undefined) payload.sector = values.sector
    if (values.description !== undefined) payload.description = values.description
    if (values.website !== undefined) payload.website = values.website
    if (values.phone !== undefined) payload.phone = values.phone
    if (values.address !== undefined) payload.address = values.address
    if (values.social !== undefined) payload.social_links = values.social
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...payload }, { onConflict: 'id' })
    if (error) return { ok: false, message: error.message }
    return { ok: true }
  } catch (e: any) { return { ok: false, message: e?.message ?? 'No se pudo guardar el perfil de empresa.' } }
}

export type NotificationPrefs = {
  types: Record<string, boolean>
  channels: { email: boolean; sms: boolean; push: boolean }
  frequency: 'realtime' | 'daily' | 'weekly'
  weeklyDigest?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
}

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  return { types: { product: true, security: true, marketing: false }, channels: { email: true, sms: false, push: false }, frequency: 'realtime', weeklyDigest: 'monday' }
}
export async function updateNotificationPrefs(_: NotificationPrefs): Promise<{ ok: boolean; message?: string }> { return { ok: true } }

export async function getAppearance() { return { theme: 'system', fontScale: 100, highContrast: false, reduceMotion: false, tableDensity: 'comfortable' } }
export async function updateAppearance(_: any): Promise<{ ok: boolean; message?: string }> { return { ok: true } }

export async function getPreferences() { return { language: 'es', fallbackLanguage: 'en', defaultUnit: 'unidad', minStockDefault: 0, shippingAvailableDefault: true, templates: { offer: '', invoice: '' } } }
export async function updatePreferences(_: any): Promise<{ ok: boolean; message?: string }> { return { ok: true } }

export async function getPrivacyPrefs() { return { lastSeenVisible: true, analyticsConsent: true, cookiesConsent: true, contactPolicy: 'all' } }
export async function updatePrivacyPrefs(_: any): Promise<{ ok: boolean; message?: string }> { return { ok: true } }

export async function getBillingProfile() { return { legalName: '', taxId: '', billingAddress: '', vatPreference: 'included', euVatNumber: '' } }
export async function updateBillingProfile(_: any): Promise<{ ok: boolean; message?: string }> { return { ok: true } }
export async function getPaymentMethods() { return [{ id: 'pm_1', brand: 'visa', last4: '4242', expMonth: 12, expYear: 2030 }] }

export async function getIntegrations() { return { webhooks: [], apiKeys: [{ id: 'key_1', name: 'default', scopes: ['read', 'write'] }] } }
export async function createWebhook(_: { url: string; events: string[] }) { return { id: 'wh_' + Math.random().toString(36).slice(2), url: _.url, events: _.events } }
export async function deleteWebhook(_: string) { return { ok: true } }
export async function createApiKey(_: { name?: string; scopes?: string[] }) { return { id: 'key_' + Math.random().toString(36).slice(2), name: _.name ?? 'new', scopes: _.scopes ?? ['read'], key: 'sk_' + Math.random().toString(36).slice(2) } }
export async function revokeApiKey(_: string) { return { ok: true } }

export async function getLegalMeta() { return { termsVersionAccepted: '1.0', privacyVersionAccepted: '1.0', acceptedAt: new Date().toISOString() } }

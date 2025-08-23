
/**
 * src/components/settings/sections/Account.tsx (v3)
 * - Reads getAccountBasics() and getSessions() on mount
 * - Shows name/email/avatar; change email/password; save name/avatar
 * - Table of current session
 * - "Cerrar todas" => revokeAllSessions()
 */

import React, { useEffect, useMemo, useState } from 'react'
import {
  getAccountBasics,
  updateAccountBasics,
  changeAuth,
  getSessions,
  revokeAllSessions,
  type AccountBasics,
  type SessionInfo,
} from '@/lib/settings/api'

type BusyState = {
  saveBasics?: boolean
  changeEmail?: boolean
  changePassword?: boolean
  revokeAll?: boolean
}

export default function AccountSection() {
  const [basics, setBasics] = useState<AccountBasics | null>(null)
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [busy, setBusy] = useState<BusyState>({})
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  async function loadAll() {
    const [b, s] = await Promise.all([getAccountBasics(), getSessions()])
    setBasics(b)
    setName(b.name ?? '')
    setAvatar(b.avatar ?? '')
    setSessions(s)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try { await loadAll() }
      catch (e: any) {
        if (!mounted) return
        setMessage(e?.message ?? 'No se pudo cargar la cuenta. Revisa configuración de Supabase.')
        setBasics({ email: null, emailVerified: false, name: null, avatar: null })
        setSessions([{ current: true }])
      }
    })()
    return () => { mounted = false }
  }, [])

  const verifiedBadge = useMemo(() => {
    if (!basics) return null
    return basics.emailVerified
      ? <span style={{ marginLeft: 8, padding: '2px 6px', borderRadius: 6, background: '#E6F4EA', color: '#1E7A34', fontSize: 12 }}>Verificado</span>
      : <span style={{ marginLeft: 8, padding: '2px 6px', borderRadius: 6, background: '#FDECEA', color: '#B42318', fontSize: 12 }}>No verificado</span>
  }, [basics])

  async function onSaveBasics() {
    setBusy(b => ({ ...b, saveBasics: true })); setMessage(null)
    try {
      const res = await updateAccountBasics({ name, avatar })
      if (res.ok) { await loadAll(); setMessage('Cambios guardados.') }
      else { setMessage(res.message ?? 'No se pudo guardar.') }
    } finally { setBusy(b => ({ ...b, saveBasics: false })) }
  }

  async function onChangeEmail() {
    if (!newEmail) return
    setBusy(b => ({ ...b, changeEmail: true })); setMessage(null)
    try {
      const res = await changeAuth({ newEmail })
      setMessage(res.ok ? 'Email actualizado. Revisa tu correo para confirmar.' : (res.message ?? 'No se pudo actualizar el email.'))
    } finally { setBusy(b => ({ ...b, changeEmail: false })) }
  }

  async function onChangePassword() {
    if (!newPassword) return
    setBusy(b => ({ ...b, changePassword: true })); setMessage(null)
    try {
      const res = await changeAuth({ newPassword })
      setMessage(res.ok ? 'Contraseña actualizada.' : (res.message ?? 'No se pudo actualizar la contraseña.'))
    } finally { setBusy(b => ({ ...b, changePassword: false })) }
  }

  async function onRevokeAll() {
    setBusy(b => ({ ...b, revokeAll: true })); setMessage(null)
    try {
      const res = await revokeAllSessions()
      setMessage(res.ok ? 'Sesiones cerradas globalmente.' : (res.message ?? 'No se pudieron cerrar las sesiones.'))
    } finally { setBusy(b => ({ ...b, revokeAll: false })) }
  }

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 760 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Cuenta</h2>

      {/* Basics */}
      <section style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Información básica</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Email</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>{basics?.email ?? '—'}</span>
              {verifiedBadge}
            </div>
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Nombre</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre"
              style={{ padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8 }} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>Avatar (URL)</span>
            <input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..."
              style={{ padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8 }} />
          </label>

          {avatar ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={avatar} alt="avatar" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '1px solid #E5E7EB' }} />
              <span style={{ fontSize: 12, color: '#6B7280' }}>Vista previa</span>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onSaveBasics} disabled={!!busy.saveBasics} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #111827' }}>
              {busy.saveBasics ? 'Guardando…' : 'Guardar nombre / avatar'}
            </button>
          </div>
        </div>
      </section>

      {/* Change email / password */}
      <section style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Seguridad de acceso</h3>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr auto', alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Nuevo email</span>
              <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="nuevo@email.com"
                style={{ padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8 }} />
            </label>
            <button onClick={onChangeEmail} disabled={!newEmail || !!busy.changeEmail} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #111827' }}>
              {busy.changeEmail ? 'Actualizando…' : 'Cambiar email'}
            </button>
          </div>

          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr auto', alignItems: 'end' }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Nueva contraseña</span>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••"
                style={{ padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8 }} />
            </label>
            <button onClick={onChangePassword} disabled={!newPassword || !!busy.changePassword} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid '#111827'" }}>
              {busy.changePassword ? 'Actualizando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </div>
      </section>

      {/* Sessions */}
      <section style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontWeight: 600 }}>Sesiones y dispositivos</h3>
          <button onClick={onRevokeAll} disabled={!!busy.revokeAll} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #B91C1C', color: '#B91C1C' }}>
            {busy.revokeAll ? 'Cerrando…' : 'Cerrar todas'}
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #E5E7EB' }}>IP</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #E5E7EB' }}>Dispositivo</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #E5E7EB' }}>Actual</th>
                <th style={{ textAlign: 'left', padding: 8, borderBottom: '1px solid #E5E7EB' }}>Expira</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s, i) => (
                <tr key={i}>
                  <td style={{ padding: 8, borderBottom: '1px solid #F3F4F6' }}>{s.ip ?? '—'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #F3F4F6', maxWidth: 520, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{s.device ?? '—'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #F3F4F6' }}>{s.current ? 'Sí' : 'No'}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #F3F4F6' }}>{s.expiresAt ? new Date(s.expiresAt).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {message ? <div style={{ padding: 12, borderRadius: 8, background: '#F3F4F6' }}>{message}</div> : null}
    </div>
  )
}

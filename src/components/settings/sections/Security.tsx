
/**
 * src/components/settings/sections/Security.tsx (v2)
 * - 2FA TOTP: enroll -> show QR/secret -> verify -> unenroll
 */

import React, { useEffect, useMemo, useState } from 'react'
import { mfaListFactors, mfaEnrollTotp, mfaVerifyTotp, mfaUnenroll } from '@/lib/settings/api'

type TotpState =
  | { step: 'idle' }
  | { step: 'enrolled', factorId: string, qrSvg?: string, secret?: string }
  | { step: 'verifying', factorId: string, code: string }

export default function SecuritySection() {
  const [factors, setFactors] = useState<Array<{ id: string; status: string }>>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [totp, setTotp] = useState<TotpState>({ step: 'idle' })
  const [code, setCode] = useState('')

  async function refreshFactors() {
    const { totp } = await mfaListFactors()
    setFactors(totp)
  }

  useEffect(() => { refreshFactors() }, [])

  const isActive = useMemo(() => factors.some(f => f.status === 'verified' || f.status === 'active'), [factors])

  async function onEnable() {
    setBusy(true); setMsg(null)
    try {
      const res = await mfaEnrollTotp()
      if (!res.ok || !res.data) { setMsg(res.message ?? 'No se pudo iniciar el alta de 2FA.'); return }
      setTotp({ step: 'enrolled', factorId: res.data.factorId, qrSvg: res.data.qrSvg, secret: res.data.secret })
    } finally { setBusy(false) }
  }

  async function onVerify() {
    if (code.trim().length < 6 || !(totp as any).factorId) return
    setBusy(true); setMsg(null)
    try {
      const fid = (totp as any).factorId as string
      const res = await mfaVerifyTotp(fid, code.trim())
      if (!res.ok) { setMsg(res.message ?? 'Código inválido.'); return }
      setMsg('2FA activado correctamente.'); setCode(''); setTotp({ step: 'idle' }); await refreshFactors()
    } finally { setBusy(false) }
  }

  async function onDisable() {
    const totpFactor = factors.find(f => f.status === 'verified' || f.status === 'active') || factors[0]
    if (!totpFactor) { setMsg('No hay factor TOTP para desactivar.'); return }
    setBusy(true); setMsg(null)
    try {
      const res = await mfaUnenroll(totpFactor.id)
      if (!res.ok) { setMsg(res.message ?? 'No se pudo desactivar el 2FA.'); return }
      setMsg('2FA desactivado.'); await refreshFactors()
    } finally { setBusy(false) }
  }

  return (
    <div style={{ display: 'grid', gap: 24, maxWidth: 760 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Seguridad</h2>
      <section style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontWeight: 600, margin: 0 }}>Autenticación en dos pasos (2FA)</h3>
            <div style={{ fontSize: 14, color: '#6B7280' }}>Estado: {isActive ? <b>Activado</b> : <b>Desactivado</b>}</div>
          </div>
          {!isActive ? (
            <button onClick={onEnable} disabled={busy} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #111827' }}>
              {busy ? 'Cargando…' : 'Activar'}
            </button>
          ) : (
            <button onClick={onDisable} disabled={busy} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #B91C1C', color: '#B91C1C' }}>
              {busy ? 'Desactivando…' : 'Desactivar'}
            </button>
          )}
        </div>

        {totp.step === 'enrolled' ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ fontSize: 14 }}>Escanea el QR con tu app de autenticación y escribe el código de 6 dígitos.</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ width: 180, height: 180, border: '1px solid #E5E7EB', borderRadius: 8, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                {(totp as any).qrSvg ? <div dangerouslySetInnerHTML={{ __html: (totp as any).qrSvg }} /> : (
                  <div style={{ fontSize: 12, color: '#6B7280', padding: 12 }}>
                    QR no disponible — usa el secreto:
                    <br /><code>{(totp as any).secret ?? '—'}</code>
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <label style={{ display: 'grid', gap: 6 }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>Código de 6 dígitos</span>
                  <input value={code} onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0,6))}
                    inputMode="numeric" placeholder="123456"
                    style={{ padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8, width: 120, fontSize: 18, letterSpacing: 4, textAlign: 'center' }} />
                </label>
                <div>
                  <button onClick={onVerify} disabled={busy || code.length !== 6} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #111827' }}>
                    {busy ? 'Verificando…' : 'Verificar y activar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: 16, fontSize: 12, color: '#6B7280' }}>
          Nota: el registro completo de actividad reciente requiere una tabla de auditoría propia (pendiente).
        </div>

        {msg ? <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: '#F3F4F6' }}>{msg}</div> : null}
      </section>
    </div>
  )
}

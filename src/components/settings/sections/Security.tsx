import React from "react";
import FormSection from "../FormSection";
import { getSecuritySettings, enable2FA, disable2FA, regenerateRecoveryCodes } from "@/lib/settings/api";

export default function Security() {
  const [loading, setLoading] = React.useState(true);
  const [twoFA, setTwoFA] = React.useState(false);
  const [recovery, setRecovery] = React.useState<string[]>([]);
  const [activity, setActivity] = React.useState<Array<{at:string; ip?:string|null; device?:string|null; event:string}>>([]);

  React.useEffect(() => {
    (async () => {
      const s = await getSecuritySettings();
      setTwoFA(s.twoFAEnabled);
      setRecovery(s.recoveryCodes || []);
      setActivity(s.recentActivity || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <div className="space-y-4">
      <FormSection title="Autenticación en dos pasos (2FA)" description="Protege tu cuenta con códigos de un solo uso.">
        <div className="flex items-center gap-3">
          <span>Estado: <b>{twoFA ? "Activado" : "Desactivado"}</b></span>
          {twoFA ? (
            <button className="px-3 py-1.5 rounded-xl border" onClick={async ()=>{ await disable2FA(); setTwoFA(false); }}>Desactivar</button>
          ) : (
            <button className="px-3 py-1.5 rounded-xl border" onClick={async ()=>{ const r=await enable2FA(); setTwoFA(true); setRecovery(r.recoveryCodes); }}>Activar</button>
          )}
        </div>
        {!!recovery.length && (
          <div className="mt-3">
            <div className="text-sm text-zinc-600 mb-1">Códigos de recuperación:</div>
            <ul className="list-disc pl-5 text-sm">{recovery.map(c => <li key={c}>{c}</li>)}</ul>
            <button className="mt-2 px-3 py-1.5 rounded-xl border" onClick={async()=>{ const codes=await regenerateRecoveryCodes(); setRecovery(codes); }}>Regenerar códigos</button>
          </div>
        )}
      </FormSection>

      <FormSection title="Actividad reciente" description="Inicios de sesión, IPs y dispositivos">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-2">Fecha</th><th className="text-left p-2">Evento</th><th className="text-left p-2">IP</th><th className="text-left p-2">Dispositivo</th></tr></thead>
            <tbody>
              {activity.map((a, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{a.at}</td>
                  <td className="p-2">{a.event}</td>
                  <td className="p-2">{a.ip || "—"}</td>
                  <td className="p-2">{a.device || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FormSection>

      <FormSection title="Alertas de seguridad por email">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="scale-110" defaultChecked />
          <span>Notificar nuevos dispositivos por email</span>
        </label>
      </FormSection>
    </div>
  );
}

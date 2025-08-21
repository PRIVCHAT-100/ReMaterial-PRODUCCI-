import React from "react";
import FormSection from "../FormSection";
import { getAccountBasics, updateAccountBasics, changeAuth, getSessions, revokeAllSessions, getLocalePrefs, updateLocalePrefs } from "@/lib/settings/api";

export default function Account() {
  const [loading, setLoading] = React.useState(true);
  const [basics, setBasics] = React.useState<{ name: string; email: string; emailVerified: boolean; avatarUrl?: string | null}>({ name: "", email: "", emailVerified: false });
  const [locale, setLocale] = React.useState<{ timezone?: string | null; dateFormat?: "DMY"|"MDY"|"YMD"; currency?: string | null }>({});
  const [sessions, setSessions] = React.useState<Array<{id:string; createdAt:string; lastActiveAt?:string|null; ip?:string|null; device?:string|null; current?:boolean}>>([]);

  React.useEffect(() => {
    (async () => {
      const b = await getAccountBasics();
      const l = await getLocalePrefs();
      const s = await getSessions();
      setBasics(b as any);
      setLocale(l as any);
      setSessions(s as any);
      setLoading(false);
    })();
  }, []);

  async function saveBasics() {
    await updateAccountBasics({ name: basics.name, avatarUrl: basics.avatarUrl });
    alert("Datos guardados");
  }

  async function saveLocale() {
    await updateLocalePrefs(locale);
    alert("Preferencias guardadas");
  }

  async function onChangePassword() {
    const currentPassword = prompt("Introduce tu contraseña actual") || undefined;
    const newPassword = prompt("Nueva contraseña") || undefined;
    if (!newPassword) return;
    await changeAuth({ currentPassword, newPassword });
    alert("Contraseña cambiada");
  }

  async function onRevokeAll() {
    if (!confirm("¿Cerrar todas las sesiones activas?")) return;
    await revokeAllSessions();
    alert("Sesiones cerradas");
  }

  if (loading) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <div className="space-y-4">
      <FormSection title="Perfil" description="Foto, nombre y email">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Nombre</span>
            <input className="rounded-xl border p-2" value={basics.name} onChange={e=>setBasics(v=>({...v, name:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Email</span>
            <input className="rounded-xl border p-2" value={basics.email} onChange={e=>setBasics(v=>({...v, email:e.target.value}))} disabled />
            <span className="text-xs">{basics.emailVerified ? "Email verificado" : "Email no verificado"}</span>
          </label>
        </div>
        <div className="flex justify-end">
          <button onClick={saveBasics} className="px-4 py-2 rounded-xl border">Guardar</button>
        </div>
      </FormSection>

      <FormSection title="Seguridad: cambiar contraseña" description="Actualiza tu contraseña">
        <button onClick={onChangePassword} className="px-4 py-2 rounded-xl border">Cambiar contraseña</button>
      </FormSection>

      <FormSection title="Sesiones y dispositivos" description="Cerrar todas las sesiones activas">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr><th className="text-left p-2">Dispositivo</th><th className="text-left p-2">IP</th><th className="text-left p-2">Última actividad</th><th></th></tr></thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{s.device || "—"} {s.current && <span className="ml-1 text-xs px-2 py-0.5 rounded bg-zinc-100">Actual</span>}</td>
                  <td className="p-2">{s.ip || "—"}</td>
                  <td className="p-2">{s.lastActiveAt || "—"}</td>
                  <td className="p-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end">
          <button onClick={onRevokeAll} className="px-4 py-2 rounded-xl border">Cerrar todas</button>
        </div>
      </FormSection>

      <FormSection title="Zona horaria, fecha y moneda">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Zona horaria</span>
            <input className="rounded-xl border p-2" value={locale.timezone || ""} onChange={e=>setLocale(v=>({...v, timezone:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Formato de fecha</span>
            <select className="rounded-xl border p-2" value={locale.dateFormat || "DMY"} onChange={e=>setLocale(v=>({...v, dateFormat:e.target.value as any}))}>
              <option value="DMY">DD/MM/YYYY</option>
              <option value="MDY">MM/DD/YYYY</option>
              <option value="YMD">YYYY/MM/DD</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Moneda</span>
            <input className="rounded-xl border p-2" value={locale.currency || ""} onChange={e=>setLocale(v=>({...v, currency:e.target.value}))} />
          </label>
        </div>
        <div className="flex justify-end">
          <button onClick={saveLocale} className="px-4 py-2 rounded-xl border">Guardar</button>
        </div>
      </FormSection>

      <FormSection title="Eliminar cuenta" description="Esta acción es permanente. Perderás acceso y tus conversaciones no podrán reabrirse.">
        <button className="px-4 py-2 rounded-xl border border-red-500 text-red-600"
          onClick={() => {
            if (confirm("¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
              alert("Implementar: delete account flow");
            }
          }}
        >
          Eliminar cuenta
        </button>
      </FormSection>
    </div>
  );
}

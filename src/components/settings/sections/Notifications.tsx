import React from "react";
import FormSection from "../FormSection";
import { getNotificationPrefs, updateNotificationPrefs } from "@/lib/settings/api";

export default function Notifications() {
  const [loading, setLoading] = React.useState(true);
  const [prefs, setPrefs] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const p = await getNotificationPrefs();
      setPrefs(p);
      setLoading(false);
    })();
  }, []);

  async function save() {
    await updateNotificationPrefs(prefs);
    alert("Preferencias de notificaciones guardadas");
  }

  if (loading || !prefs) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <FormSection title="Notificaciones">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="font-medium">Canales</div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={prefs.channels.email} onChange={e=>setPrefs((v:any)=>({...v, channels: {...v.channels, email: e.target.checked}}))} />
            <span>Email</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={prefs.channels.webPush} onChange={e=>setPrefs((v:any)=>({...v, channels: {...v.channels, webPush: e.target.checked}}))} />
            <span>Web push</span>
          </label>
        </div>

        <div className="space-y-2">
          <div className="font-medium">Tipos</div>
          {Object.entries(prefs.types).map(([k, val]) => (
            <label key={k} className="flex items-center gap-2 capitalize">
              <input type="checkbox" className="scale-110" checked={!!val} onChange={e=>setPrefs((v:any)=>({...v, types: {...v.types, [k]: e.target.checked}}))} />
              <span>{k}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-4">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Frecuencia</span>
          <select className="rounded-xl border p-2" value={prefs.frequency} onChange={e=>setPrefs((v:any)=>({...v, frequency: e.target.value}))}>
            <option value="immediate">Inmediato</option>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
          </select>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="scale-110" checked={!!prefs.weeklyDigest} onChange={e=>setPrefs((v:any)=>({...v, weeklyDigest: e.target.checked}))} />
          <span>Resumen semanal</span>
        </label>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={save} className="px-4 py-2 rounded-xl border">Guardar</button>
      </div>

      <FormSection title="Silenciar conversaciones" description="Selecciona conversaciones a silenciar (pendiente de integrar con tu módulo de mensajes)" />
    </FormSection>
  );
}

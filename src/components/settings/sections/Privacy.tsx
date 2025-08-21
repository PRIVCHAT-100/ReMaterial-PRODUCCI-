import React from "react";
import FormSection from "../FormSection";
import { getPrivacyPrefs, updatePrivacyPrefs } from "@/lib/settings/api";

export default function Privacy() {
  const [loading, setLoading] = React.useState(true);
  const [prefs, setPrefs] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const p = await getPrivacyPrefs();
      setPrefs(p);
      setLoading(false);
    })();
  }, []);

  async function save() {
    await updatePrivacyPrefs(prefs);
    alert("Preferencias de privacidad guardadas");
  }

  if (loading || !prefs) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <div className="space-y-4">
      <FormSection title="Quién puede contactarte">
        <select className="rounded-xl border p-2" value={prefs.contactPolicy} onChange={e=>setPrefs((v:any)=>({...v, contactPolicy: e.target.value}))}>
          <option value="all">Todos</option>
          <option value="verified">Solo verificados</option>
          <option value="previous">Solo contactos previos</option>
        </select>
      </FormSection>

      <FormSection title="Bloqueos">
        <div className="text-sm text-zinc-600">Implementar UI para bloquear/desbloquear usuarios y empresas.</div>
      </FormSection>

      <FormSection title="Visibilidad y consentimiento">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="scale-110" checked={prefs.lastSeenVisible} onChange={e=>setPrefs((v:any)=>({...v, lastSeenVisible: e.target.checked}))} />
          <span>Mostrar última conexión</span>
        </label>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={!!prefs.analyticsConsent} onChange={e=>setPrefs((v:any)=>({...v, analyticsConsent: e.target.checked}))} />
            <span>Consentimiento analytics</span>
          </label>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" className="scale-110" checked={!!prefs.cookiesConsent} onChange={e=>setPrefs((v:any)=>({...v, cookiesConsent: e.target.checked}))} />
            <span>Consentimiento cookies</span>
          </label>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={save} className="px-4 py-2 rounded-xl border">Guardar</button>
        </div>
      </FormSection>

      <FormSection title="Descarga de datos (GDPR)">
        <button className="px-4 py-2 rounded-xl border" onClick={()=>alert("Implementar exportación GDPR")}>Solicitar exportación</button>
      </FormSection>
    </div>
  );
}

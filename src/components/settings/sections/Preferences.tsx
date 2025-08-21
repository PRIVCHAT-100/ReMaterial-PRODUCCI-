import React from "react";
import FormSection from "../FormSection";
import { getPreferences, updatePreferences } from "@/lib/settings/api";

export default function Preferences() {
  const [loading, setLoading] = React.useState(true);
  const [prefs, setPrefs] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const p = await getPreferences();
      setPrefs(p);
      setLoading(false);
    })();
  }, []);

  async function save() {
    await updatePreferences(prefs);
    alert("Preferencias guardadas");
  }

  if (loading || !prefs) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <FormSection title="Preferencias">
      <div className="grid md:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Idioma</span>
          <select className="rounded-xl border p-2" value={prefs.language} onChange={e=>setPrefs((v:any)=>({...v, language: e.target.value}))}>
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="ca">Català</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Fallback</span>
          <select className="rounded-xl border p-2" value={prefs.fallbackLanguage} onChange={e=>setPrefs((v:any)=>({...v, fallbackLanguage: e.target.value}))}>
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="ca">Català</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Unidad por defecto</span>
          <input className="rounded-xl border p-2" value={prefs.defaultUnit||""} onChange={e=>setPrefs((v:any)=>({...v, defaultUnit: e.target.value}))} />
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="scale-110" checked={!!prefs.shippingAvailableDefault} onChange={e=>setPrefs((v:any)=>({...v, shippingAvailableDefault: e.target.checked}))} />
          <span>Envío disponible por defecto</span>
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Stock mínimo por defecto</span>
          <input type="number" className="rounded-xl border p-2" value={prefs.minStockDefault||0} onChange={e=>setPrefs((v:any)=>({...v, minStockDefault: Number(e.target.value)}))} />
        </label>
      </div>

      <div className="grid gap-3 mt-4">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Plantilla de oferta</span>
          <textarea className="rounded-xl border p-2 min-h-[100px]" value={prefs.templates?.offer || ""} onChange={e=>setPrefs((v:any)=>({...v, templates:{ ...(v.templates||{}), offer: e.target.value }}))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Plantilla de contrato</span>
          <textarea className="rounded-xl border p-2 min-h-[100px]" value={prefs.templates?.contract || ""} onChange={e=>setPrefs((v:any)=>({...v, templates:{ ...(v.templates||{}), contract: e.target.value }}))} />
        </label>
      </div>

      <div className="flex justify-end mt-4">
        <button onClick={save} className="px-4 py-2 rounded-xl border">Guardar</button>
      </div>
    </FormSection>
  );
}

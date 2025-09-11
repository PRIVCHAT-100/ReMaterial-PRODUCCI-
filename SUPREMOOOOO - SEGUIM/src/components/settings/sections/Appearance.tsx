import React from "react";
import FormSection from "../FormSection";
import { getAppearance, updateAppearance } from "@/lib/settings/api";

export default function Appearance() {
  const [loading, setLoading] = React.useState(true);
  const [prefs, setPrefs] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const p = await getAppearance();
      setPrefs(p);
      setLoading(false);
    })();
  }, []);

  async function save() {
    await updateAppearance(prefs);
    alert("Apariencia guardada");
  }

  if (loading || !prefs) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <FormSection title="Accesibilidad y apariencia">
      <div className="grid md:grid-cols-3 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Tema</span>
          <select className="rounded-xl border p-2" value={prefs.theme} onChange={e=>setPrefs((v:any)=>({...v, theme: e.target.value}))}>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
            <option value="system">Sistema</option>
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Tamaño de fuente</span>
          <input type="number" step="0.1" className="rounded-xl border p-2" value={prefs.fontScale||1} onChange={e=>setPrefs((v:any)=>({...v, fontScale: Number(e.target.value)}))} />
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="scale-110" checked={!!prefs.highContrast} onChange={e=>setPrefs((v:any)=>({...v, highContrast: e.target.checked}))} />
          <span>Contraste elevado</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="scale-110" checked={!!prefs.reduceMotion} onChange={e=>setPrefs((v:any)=>({...v, reduceMotion: e.target.checked}))} />
          <span>Reducir animaciones</span>
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Densidad de tablas</span>
          <select className="rounded-xl border p-2" value={prefs.tableDensity||"comfortable"} onChange={e=>setPrefs((v:any)=>({...v, tableDensity: e.target.value}))}>
            <option value="compact">Compacta</option>
            <option value="comfortable">Cómoda</option>
          </select>
        </label>
      </div>
      <div className="flex justify-end mt-4">
        <button onClick={save} className="px-4 py-2 rounded-xl border">Guardar</button>
      </div>
    </FormSection>
  );
}

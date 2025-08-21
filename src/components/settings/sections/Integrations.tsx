import React from "react";
import FormSection from "../FormSection";
import { getIntegrations, createWebhook, deleteWebhook, createApiKey, revokeApiKey } from "@/lib/settings/api";

export default function Integrations() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const d = await getIntegrations();
      setData(d);
      setLoading(false);
    })();
  }, []);

  if (loading || !data) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <div className="space-y-4">
      <FormSection title="Calendario">
        <button className="px-4 py-2 rounded-xl border" onClick={()=>alert("Conectar calendario: Google/Microsoft")}>{data.calendarConnected ? "Conectado" : "Conectar"}</button>
      </FormSection>

      <FormSection title="Webhooks">
        <button className="px-3 py-1.5 rounded-xl border" onClick={async()=>{ await createWebhook("https://example.com/hook", ["*"]); alert("Webhook creado (demo)"); }}>Añadir webhook (demo)</button>
        <ul className="text-sm mt-3">{data.webhooks?.map((w:any) => (
          <li key={w.id} className="flex items-center justify-between border rounded-xl p-2 mt-2">
            <span>{w.url}</span>
            <button className="px-3 py-1.5 rounded-xl border" onClick={async()=>{ await deleteWebhook(w.id); alert("Webhook eliminado (demo)"); }}>Eliminar</button>
          </li>
        ))}</ul>
      </FormSection>

      <FormSection title="API Keys">
        <button className="px-3 py-1.5 rounded-xl border" onClick={async()=>{ const k = await createApiKey("Nueva clave", ["read"]); alert("API Key creada: " + k.key); }}>Crear API Key</button>
        <ul className="text-sm mt-3">{data.apiKeys?.map((k:any)=>(
          <li key={k.id} className="flex items-center justify-between border rounded-xl p-2 mt-2">
            <span>{k.name} · {k.scopes?.join(", ")}</span>
            <button className="px-3 py-1.5 rounded-xl border" onClick={async()=>{ await revokeApiKey(k.id); alert("Key revocada (demo)"); }}>Revocar</button>
          </li>
        ))}</ul>
      </FormSection>
    </div>
  );
}

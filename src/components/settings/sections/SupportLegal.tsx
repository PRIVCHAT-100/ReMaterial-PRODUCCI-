import React from "react";
import FormSection from "../FormSection";
import { getLegalMeta } from "@/lib/settings/api";

export default function SupportLegal() {
  const [loading, setLoading] = React.useState(true);
  const [meta, setMeta] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const m = await getLegalMeta();
      setMeta(m);
      setLoading(false);
    })();
  }, []);

  if (loading || !meta) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <div className="space-y-4">
      <FormSection title="Centro de ayuda">
        <button className="px-3 py-1.5 rounded-xl border" onClick={()=>alert("Abrir centro de ayuda / FAQ")}>Abrir ayuda</button>
      </FormSection>

      <FormSection title="Contactar soporte">
        <button className="px-3 py-1.5 rounded-xl border" onClick={()=>alert("Crear ticket o mailto:support@rematerial.example")}>Crear ticket</button>
      </FormSection>

      <FormSection title="Estado del sistema">
        <a className="underline" href="#" onClick={(e)=>{e.preventDefault(); alert("Ir a página de status");}}>Ver estado</a>
      </FormSection>

      <FormSection title="Legal">
        <div className="text-sm text-zinc-600">Términos y Condiciones — versión {meta.termsVersionAccepted || "—"}</div>
        <div className="text-sm text-zinc-600">Privacidad — versión {meta.privacyVersionAccepted || "—"}</div>
        <div className="text-sm text-zinc-600">Aceptado el {meta.acceptedAt ? new Date(meta.acceptedAt).toLocaleString() : "—"}</div>
      </FormSection>

      <FormSection title="Reportar un problema / sugerencias">
        <button className="px-3 py-1.5 rounded-xl border" onClick={()=>alert("Abrir formulario de reporte")}>Reportar</button>
      </FormSection>
    </div>
  );
}

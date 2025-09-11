import React from "react";
import { useProfileRole } from "@/hooks/useProfileRole";
import FormSection from "../FormSection";
import CompanyAddress from "./CompanyAddress";
import { getCompanyProfile, updateCompanyProfile } from "@/lib/settings/api";

export default function Company() {
  // SettingsRoleGuardApplied
  const role = useProfileRole();
  if (role.data && role.data.isAuthenticated && !role.data.isSeller) {
    return null;
  }

  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<any>({ legalName:"", tradeName:"", taxId:"", sector:"", description:"", website:"", phone:"", address:"", visibility:"public" });

  React.useEffect(() => {
    (async () => {
      const c = await getCompanyProfile();
      setForm({ ...form, ...c });
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    await updateCompanyProfile(form);
    alert("Empresa actualizada");
  }

  if (loading) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <div className="space-y-4">
      <FormSection title="Datos de empresa">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Razón social</span>
            <input className="rounded-xl border p-2" value={form.legalName} onChange={e=>setForm((v:any)=>({...v, legalName:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Nombre comercial</span>
            <input className="rounded-xl border p-2" value={form.tradeName} onChange={e=>setForm((v:any)=>({...v, tradeName:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">CIF/NIF</span>
            <input className="rounded-xl border p-2" value={form.taxId} onChange={e=>setForm((v:any)=>({...v, taxId:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Sector</span>
            <input className="rounded-xl border p-2" value={form.sector} onChange={e=>setForm((v:any)=>({...v, sector:e.target.value}))} />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm text-zinc-600">Descripción</span>
            <textarea className="rounded-xl border p-2 min-h-[100px]" value={form.description ?? ""} onChange={e=>setForm((v:any)=>({...v, description:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Web</span>
            <input className="rounded-xl border p-2" value={form.website} onChange={e=>setForm((v:any)=>({...v, website:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Teléfono</span>
            <input className="rounded-xl border p-2" value={form.phone} onChange={e=>setForm((v:any)=>({...v, phone:e.target.value}))} />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm text-zinc-600">Dirección</span>
            <input className="rounded-xl border p-2" value={form.address} onChange={e=>setForm((v:any)=>({...v, address:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Visibilidad</span>
            <select className="rounded-xl border p-2" value={form.visibility} onChange={e=>setForm((v:any)=>({...v, visibility:e.target.value}))}>
              <option value="public">Pública</option>
              <option value="private">Privada</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end">
          <button onClick={save} className="px-4 py-2 rounded-xl border">Guardar</button>
        </div>
      </FormSection>

      <FormSection title="Redes sociales">
        <div className="grid md:grid-cols-2 gap-3">
          {["linkedin","twitter","instagram","facebook","youtube","tiktok"].map((key)=> (
            <label key={key} className="grid gap-1">
              <span className="text-sm text-zinc-600">{key}</span>
              <input className="rounded-xl border p-2" value={form.social?.[key]||""} onChange={e=>setForm((v:any)=>({...v, social:{ ...(v.social||{}), [key]: e.target.value }}))} />
            </label>
          ))}
        </div>
      </FormSection>

      <FormSection title="Certificaciones" description="Sube documentos PDF (ISO 14001, EMAS, etc.)">
        <button className="px-4 py-2 rounded-xl border" onClick={()=>alert("Implementar subida de PDF a Supabase Storage")}>Subir certificación</button>
      </FormSection>

      <FormSection title="Verificación de empresa" description="Sube documentos para verificar tu empresa">
        <button className="px-4 py-2 rounded-xl border" onClick={()=>alert("Implementar verificación: estado pendiente/aprobado")}>Iniciar verificación</button>
      </FormSection>

      {/* Dirección de la empresa */}
      <CompanyAddress />

    </div>
  );
}

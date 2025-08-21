import React from "react";
import FormSection from "../FormSection";
import { getPersonalProfile, updatePersonalProfile } from "@/lib/settings/api";

export default function PersonalProfile() {
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState({ firstName:"", lastName:"", phone:"", phoneVisible:true, role:"", bio:"" });

  React.useEffect(() => {
    (async () => {
      const p = await getPersonalProfile();
      setForm({ firstName:p.firstName||"", lastName:p.lastName||"", phone:p.phone||"", phoneVisible: !!p.phoneVisible, role:p.role||"", bio:p.bio||"" });
      setLoading(false);
    })();
  }, []);

  async function save() {
    await updatePersonalProfile(form);
    alert("Perfil actualizado");
  }

  if (loading) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <FormSection title="Perfil personal" description="Datos visibles en tu perfil">
      <div className="grid md:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Nombre</span>
          <input className="rounded-xl border p-2" value={form.firstName} onChange={e=>setForm(v=>({...v, firstName:e.target.value}))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Apellidos</span>
          <input className="rounded-xl border p-2" value={form.lastName} onChange={e=>setForm(v=>({...v, lastName:e.target.value}))} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Teléfono</span>
          <input className="rounded-xl border p-2" value={form.phone} onChange={e=>setForm(v=>({...v, phone:e.target.value}))} />
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="scale-110" checked={form.phoneVisible} onChange={e=>setForm(v=>({...v, phoneVisible:e.target.checked}))} />
          <span>Mostrar teléfono en el perfil</span>
        </label>
        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm text-zinc-600">Rol</span>
          <input className="rounded-xl border p-2" value={form.role} onChange={e=>setForm(v=>({...v, role:e.target.value}))} />
        </label>
        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm text-zinc-600">Bio</span>
          <textarea className="rounded-xl border p-2 min-h-[100px]" value={form.bio} onChange={e=>setForm(v=>({...v, bio:e.target.value}))} />
        </label>
      </div>
      <div className="flex justify-end">
        <button onClick={save} className="px-4 py-2 rounded-xl border">Guardar</button>
      </div>
    </FormSection>
  );
}

import React from "react";
import FormSection from "../FormSection";
import { getBillingProfile, updateBillingProfile, getPaymentMethods } from "@/lib/settings/api";

export default function Billing() {
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<any>({ legalName:"", taxId:"", billingAddress:"", vatPreference:"included", euVatNumber:"" });
  const [methods, setMethods] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      const b = await getBillingProfile();
      const m = await getPaymentMethods();
      setForm({ ...form, ...b });
      setMethods(m);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    await updateBillingProfile(form);
    alert("Datos de facturación guardados");
  }

  if (loading) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <div className="space-y-4">
      <FormSection title="Datos fiscales">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Razón social</span>
            <input className="rounded-xl border p-2" value={form.legalName} onChange={e=>setForm((v:any)=>({...v, legalName:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">CIF/NIF</span>
            <input className="rounded-xl border p-2" value={form.taxId} onChange={e=>setForm((v:any)=>({...v, taxId:e.target.value}))} />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm text-zinc-600">Dirección de facturación</span>
            <input className="rounded-xl border p-2" value={form.billingAddress} onChange={e=>setForm((v:any)=>({...v, billingAddress:e.target.value}))} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Preferencia de IVA</span>
            <select className="rounded-xl border p-2" value={form.vatPreference} onChange={e=>setForm((v:any)=>({...v, vatPreference:e.target.value}))}>
              <option value="included">Incluido</option>
              <option value="excluded">Excluido</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">IVA intracomunitario</span>
            <input className="rounded-xl border p-2" value={form.euVatNumber||""} onChange={e=>setForm((v:any)=>({...v, euVatNumber:e.target.value}))} />
          </label>
        </div>
        <div className="flex justify-end">
          <button onClick={save} className="px-4 py-2 rounded-xl border">Guardar</button>
        </div>
      </FormSection>

      <FormSection title="Métodos de pago">
        {methods.length === 0 ? <div className="text-sm text-zinc-600">Sin métodos de pago aún.</div> :
          <ul className="text-sm">{methods.map(m=> <li key={m.id}>{m.brand} ****{m.last4} (exp {m.expMonth}/{m.expYear})</li>)}</ul>}
        <div className="mt-3">
          <button className="px-3 py-1.5 rounded-xl border" onClick={()=>alert("Integrar Stripe")}>Añadir tarjeta</button>
        </div>
      </FormSection>
    </div>
  );
}

import { useEffect, useState } from "react";
import type { BillingData, Address, TaxData } from "@/lib/types/settings";
import { supabase } from "@/lib/supabase/client"; // instancia única

const DEFAULT: BillingData = {
  tax: { legal_name: "", tax_id: "", billing_address: "", vat_preference: "included", eu_vat_number: "" },
  payment_methods: [],
  invoices: [],
  addresses: [],
  vat_number_valid: undefined,
};

export function useBilling() {
  const [data, setData] = useState<BillingData>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [taxRes, pmRes, invRes, addrRes] = await Promise.all([
        supabase.from("billing_tax_data").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("billing_payment_methods_view").select("*").eq("user_id", user.id),
        supabase.from("billing_invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("billing_addresses").select("*").eq("user_id", user.id)
      ]);

      if (!mounted) return;

      const taxRow: any = taxRes.data || {};
      setData({
        tax: {
          legal_name: taxRow.legal_name ?? "",
          tax_id: taxRow.tax_id ?? "",
          billing_address: taxRow.billing_address ?? "",
          vat_preference: (taxRow.vat_preference ?? "included"),
          eu_vat_number: taxRow.eu_vat_number ?? "",
        },
        vat_number_valid: taxRow.vat_number_valid ?? undefined,
        payment_methods: (pmRes.data ?? []).map((r: any) => ({
          id: r.id, brand: r.brand, last4: r.last4, exp_month: r.exp_month, exp_year: r.exp_year, is_default: r.is_default
        })),
        invoices: (invRes.data ?? []).map((r: any) => ({
          id: r.id, created_at: r.created_at, amount: r.amount, currency: r.currency, download_url: r.download_url
        })),
        addresses: (addrRes.data ?? []).map((r: any) => ({
          id: r.id, label: r.label, address: r.address, is_default_pickup: r.is_default_pickup, is_default_shipping: r.is_default_shipping
        })),
      });

      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function saveTax(tax: TaxData) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = { user_id: user.id, ...tax };
    const { error } = await supabase.from("billing_tax_data").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) throw error;
    setData(d => ({ ...d, tax }));
  }

  async function addAddress(addr: Address) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from("billing_addresses")
      .insert({ user_id: user.id, ...addr })
      .select("*")
      .single();
    if (error) throw error;

    setData(d => ({
      ...d,
      addresses: [...(d.addresses || []), { ...addr, id: inserted.id }]
    }));
  }

  async function removeAddress(id: string) {
    const { error } = await supabase.from("billing_addresses").delete().eq("id", id);
    if (error) throw error;
    setData(d => ({ ...d, addresses: (d.addresses || []).filter(a => a.id !== id) }));
  }

  return { data, setData, loading, saving, saveTax, addAddress, removeAddress };
}


import React from "react";
import FormSection from "../FormSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfileRole } from "@/hooks/useProfileRole";

type Form = {
  address_line1: string;
  address_number: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
};

export default function CompanyAddress() {
  const { toast } = useToast();
  const role = useProfileRole();
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<Form>({
    address_line1: "",
    address_number: "",
    city: "",
    province: "",
    postal_code: "",
    country: "España",
  });

  React.useEffect(() => {
    (async () => {
      try {
        const { data: u, error: ue } = await supabase.auth.getUser();
        if (ue) throw ue;
        const user = u.user;
        if (!user) throw new Error("No authenticated user");

        const { data, error } = await supabase
          .from("profiles")
          .select("address_line1, address_number, city, province, postal_code, country, latitude, longitude")
          .eq("id", user.id)
          .single();
        if (error && error.code !== "PGRST116") throw error; // allow no rows

        setForm((v) => ({
          ...v,
          address_line1: data?.address_line1 ?? "",
          address_number: data?.address_number ?? "",
          city: data?.city ?? "",
          province: data?.province ?? "",
          postal_code: data?.postal_code ?? "",
          country: data?.country ?? (v.country || "España"),
          latitude: data?.latitude ?? null,
          longitude: data?.longitude ?? null,
        }));
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    try {
      setLoading(true);
      const { data: u, error: ue } = await supabase.auth.getUser();
      if (ue) throw ue;
      const user = u.user;
      if (!user) throw new Error("No authenticated user");

      // Update address fields
      const payload: any = {
        address_line1: form.address_line1 || null,
        address_number: form.address_number || null,
        city: form.city || null,
        province: form.province || null,
        postal_code: form.postal_code || null,
        country: form.country || "España",
      };

      // Optional: geocode to set latitude/longitude
      const line = [form.address_line1, form.address_number].filter(Boolean).join(" ");
      const full = [line, form.postal_code, form.city, form.province, form.country || "España"].filter(Boolean).join(", ");
      try {
        const { geocodeAddress } = await import("@/utils/geocodeAddress");
        const coords = await geocodeAddress(full);
        if (coords) {
          payload.latitude = coords.lat;
          payload.longitude = coords.lng;
          
          
        }
      } catch {}

      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...payload }, { onConflict: 'id' });
      if (error) throw error;

      toast({ title: "Dirección guardada", description: "Tu ubicación se ha actualizado correctamente." });
      window.dispatchEvent(new Event("profile:updated"));
    } catch (e: any) {
      toast({ title: "No se pudo guardar", description: e?.message ?? "Revisa los datos", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (role.data && role.data.isAuthenticated && !role.data.isSeller) {
    return null;
  }

  return (
    <FormSection title="Dirección de la empresa" description="Esta dirección se usará para ubicar tu empresa en el mapa.">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-3">
          <Label className="text-sm text-zinc-600">Calle / Dirección</Label>
          <Input value={form.address_line1} onChange={(e) => setForm((v) => ({ ...v, address_line1: e.target.value }))} placeholder="C/ Gran Via, Av. Diagonal..." />
        </div>
        <div className="md:col-span-1">
          <Label className="text-sm text-zinc-600">Nº</Label>
          <Input value={form.address_number} onChange={(e) => setForm((v) => ({ ...v, address_number: e.target.value }))} placeholder="12" />
        </div>
        <div className="md:col-span-2">
          <Label className="text-sm text-zinc-600">Ciudad</Label>
          <Input value={form.city} onChange={(e) => setForm((v) => ({ ...v, city: e.target.value }))} placeholder="Barcelona" />
        </div>
        <div className="md:col-span-2">
          <Label className="text-sm text-zinc-600">Provincia</Label>
          <Input value={form.province} onChange={(e) => setForm((v) => ({ ...v, province: e.target.value }))} placeholder="Barcelona" />
        </div>
        <div className="md:col-span-2">
          <Label className="text-sm text-zinc-600">Código postal</Label>
          <Input value={form.postal_code} onChange={(e) => setForm((v) => ({ ...v, postal_code: e.target.value }))} placeholder="08001" />
        </div>
        <div className="md:col-span-2">
          <Label className="text-sm text-zinc-600">País</Label>
          <Input value={form.country} onChange={(e) => setForm((v) => ({ ...v, country: e.target.value }))} placeholder="España" />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={loading}>{loading ? "Guardando..." : "Guardar dirección"}</Button>
      </div>
    </FormSection>
  );
}

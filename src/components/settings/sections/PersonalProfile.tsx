import React from "react";
import { useProfileRole } from "@/hooks/useProfileRole";
import FormSection from "../FormSection";
import { supabase } from "@/integrations/supabase/client";
import ProfileAvatar from "@/components/common/ProfileAvatar";

/**
 * PersonalProfile (Comprador)
 * Muestra SOLO: nombre completo, email (solo lectura), teléfono y foto de perfil.
 * Guarda directamente contra la tabla `profiles` para no tocar otros módulos.
 * Si el usuario es vendedor, este bloque no se renderiza (guard ya aplicado).
 */
export default function PersonalProfile() {
  // SettingsRoleGuardApplied
  const role = useProfileRole();
  if (role.data && role.data.isAuthenticated && role.data.isSeller) {
    return null;
  }

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [email, setEmail] = React.useState<string>("");
  const [fullName, setFullName] = React.useState<string>("");
  const [phone, setPhone] = React.useState<string>("");
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, phone, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setFullName(data.full_name ?? "");
        setPhone(data.phone ?? "");
        setAvatarUrl(data.avatar_url ?? "");
      }
      setLoading(false);
    })();
  }, []);

  async function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const { data: { user } } = await supabase.auth.getUser();
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file);
    if (!uploadErr) {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } else {
      alert(uploadErr.message);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw userErr ?? new Error("No user");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone, avatar_url: avatarUrl })
        .eq("id", user.id);
      if (error) throw error;
      alert("Perfil actualizado");
    } catch (e: any) {
      alert(e?.message ?? "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <FormSection title="Perfil personal" description="Datos básicos para comprar">
      <div className="flex items-center gap-4 mb-4">
        <ProfileAvatar src={avatarUrl} name={fullName} size="lg" />
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Foto de perfil</span>
          <input type="file" accept="image/*" onChange={onAvatarChange} />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Nombre completo</span>
          <input className="rounded-xl border p-2" value={fullName} onChange={e=>setFullName(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-sm text-zinc-600">Email</span>
          <input className="rounded-xl border p-2 bg-zinc-100" value={email} readOnly />
        </label>
        <label className="grid gap-1 md:col-span-2">
          <span className="text-sm text-zinc-600">Teléfono</span>
          <input className="rounded-xl border p-2" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+34 ..." />
        </label>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="px-4 py-2 rounded-xl border">
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </FormSection>
  );
}

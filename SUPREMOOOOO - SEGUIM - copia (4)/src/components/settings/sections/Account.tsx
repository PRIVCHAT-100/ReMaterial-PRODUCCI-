import React from "react";
import FormSection from "../FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Account settings (self‑contained, client‑only).
 * - View email + verification status
 * - Update display name and avatar (stored in user_metadata)
 * - Change email (triggers Supabase confirmation email)
 * - Change password
 * - Session controls (sign out others / all)
 * - Basic preferences (timezone, date format, currency) in user_metadata.prefs
 * - Export data (JSON) for GDPR
 *
 * NO external features modified. Only touches Supabase auth user_metadata.
 * (ACTUALIZACIÓN mínima: también sincroniza profiles.display_name)
 */

type UserMeta = Record<string, any>;
type Prefs = { tz?: string; dateFmt?: "dd/mm/yyyy" | "mm/dd/yyyy"; currency?: "EUR" | "USD" | "GBP" };

export default function Account() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);

  // Basics
  const [email, setEmail] = React.useState<string>("");
  const [emailVerified, setEmailVerified] = React.useState<boolean>(false);
  const [name, setName] = React.useState<string>("");
  const [avatar, setAvatar] = React.useState<string>("");

  // Change email/password
  const [newEmail, setNewEmail] = React.useState<string>("");
  const [pass1, setPass1] = React.useState<string>("");
  const [pass2, setPass2] = React.useState<string>("");

  // Preferences
  const [prefs, setPrefs] = React.useState<Prefs>({ tz: Intl.DateTimeFormat().resolvedOptions().timeZone, dateFmt: "dd/mm/yyyy", currency: "EUR" });

  // Session info
  const [lastSignInAt, setLastSignInAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        const user = data.user;
        setEmail(user?.email ?? "");
        setEmailVerified(Boolean(user?.email_confirmed_at || user?.confirmed_at));
        setLastSignInAt(user?.last_sign_in_at ?? null);

        const meta: UserMeta = (user?.user_metadata ?? {}) as any;
        const metaName = meta.full_name ?? meta.name ?? "";
        const metaAvatar = meta.avatar_url ?? meta.picture ?? "";
        setName(metaName);
        setAvatar(metaAvatar);

        const p: Prefs = (meta.prefs ?? {}) as Prefs;
        setPrefs({
          tz: p.tz ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
          dateFmt: p.dateFmt ?? "dd/mm/yyyy",
          currency: p.currency ?? "EUR",
        });

        // **Añadido mínimo**: si no había nombre en user_metadata,
        // intenta leer el display_name desde profiles (id = user.id)
        if (!metaName && user?.id) {
          const { data: prof, error: profErr } = await supabase
            .from("profiles")
            .select("display_name")
            .eq("id", user.id)
            .maybeSingle();
          if (!profErr && prof?.display_name) {
            setName(prof.display_name);
          }
        }
      } catch (e: any) {
        console.error(e);
        toast({ title: "Error cargando cuenta", description: e?.message ?? "No se pudo cargar la cuenta.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveBasics = async () => {
    try {
      // 1) Actualiza user_metadata (como ya hacía)
      const meta: UserMeta = {};
      if (name) meta.full_name = name, meta.name = name, (meta as any).company_name = name;
      if (avatar) meta.avatar_url = avatar, meta.picture = avatar;
      const { error: metaErr } = await supabase.auth.updateUser({ data: meta });
      if (metaErr) throw metaErr;

      // 2) **Añadido mínimo**: sincroniza también en profiles.display_name
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (user?.id && name) {
        const { error: profErr } = await supabase
          .from("profiles")
          .update({ display_name: name, company_name: name })
          .eq("id", user.id);
        if (profErr) throw profErr;
      }

      toast({ title: "Datos guardados", description: "Nombre y avatar actualizados." });
      // Opcional: si tu Header usa caché, emite un evento para re-cargar
      window.dispatchEvent(new Event("profile:updated"));
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo guardar", description: e?.message ?? "", variant: "destructive" });
    }
  };

  const changeEmail = async () => {
    if (!newEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newEmail)) {
      toast({ title: "Email no válido", description: "Escribe un email correcto.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      toast({
        title: "Confirma tu nuevo email",
        description: "Te hemos enviado un enlace de verificación al nuevo correo.",
      });
      setNewEmail("");
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo cambiar el email", description: e?.message ?? "", variant: "destructive" });
    }
  };

  const changePassword = async () => {
    if (pass1.length < 8) {
      toast({ title: "Contraseña débil", description: "Mínimo 8 caracteres.", variant: "destructive" });
      return;
    }
    if (pass1 !== pass2) {
      toast({ title: "No coinciden", description: "Repite la nueva contraseña.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: pass1 });
      if (error) throw error;
      toast({ title: "Contraseña actualizada" });
      setPass1(""); setPass2("");
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo cambiar la contraseña", description: e?.message ?? "", variant: "destructive" });
    }
  };

  const savePrefs = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ data: { prefs } });
      if (error) throw error;
      toast({ title: "Preferencias guardadas" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se guardaron las preferencias", description: e?.message ?? "", variant: "destructive" });
    }
  };

  const signOutOthers = async () => {
    try {
      // @ts-ignore (scope is part of supabase-js v2)
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      toast({ title: "Sesiones cerradas", description: "Hemos cerrado sesión en los otros dispositivos." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo cerrar", description: e?.message ?? "", variant: "destructive" });
    }
  };

  const signOutAll = async () => {
    try {
      // @ts-ignore
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
    } catch (e: any) {
      console.error(e);
    } finally {
      // Even if API fails, try local signOut
      await supabase.auth.signOut();
      window.location.href = "/";
    }
  };

  const exportData = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      const blob = new Blob([JSON.stringify(data.user, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mis-datos-rematerial.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Exportado", description: "Se descargó un JSON con tus datos de cuenta." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "No se pudo exportar", description: e?.message ?? "", variant: "destructive" });
    }
  };

  if (loading) return <div className="rounded-2xl border p-6">Cargando…</div>;

  return (
    <div className="space-y-4">
      <FormSection title="Datos de la cuenta" description="Información básica que ven otros usuarios en el chat o transacciones.">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Email</span>
            <Input value={email} disabled />
            <span className="text-xs">{emailVerified ? "Email verificado ✅" : "Email no verificado ❌"}</span>
          </label>
          <div className="grid gap-1">
            <span className="text-sm text-zinc-600">Nombre visible</span>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" />
          </div>
          <div className="grid gap-1">
            <span className="text-sm text-zinc-600">Avatar (URL)</span>
            <Input value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={saveBasics}>Guardar</Button>
        </div>
      </FormSection>

      <div data-ff="settings.account.change_email">
<FormSection title="Cambiar email" description="Enviaremos un correo de verificación al nuevo email.">
        <div className="flex gap-2">
          <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="nuevo@email.com" className="max-w-md" />
          <Button onClick={changeEmail}>Actualizar</Button>
        </div>
      </FormSection>
</div>

      <FormSection title="Cambiar contraseña" description="Por seguridad, te pediremos iniciar sesión de nuevo si es necesario.">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Nueva contraseña</span>
            <Input type="password" value={pass1} onChange={e => setPass1(e.target.value)} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Repite la contraseña</span>
            <Input type="password" value={pass2} onChange={e => setPass2(e.target.value)} />
          </label>
        </div>
        <div className="flex justify-end">
          <Button onClick={changePassword}>Actualizar contraseña</Button>
        </div>
      </FormSection>

      <FormSection title="Sesiones y dispositivos" description="Controla el acceso a tu cuenta desde otros dispositivos.">
        <div className="text-sm text-zinc-600">
          Último acceso: {lastSignInAt ? new Date(lastSignInAt).toLocaleString() : "—"}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={signOutOthers}>Cerrar otras sesiones</Button>
          <Button variant="destructive" onClick={signOutAll}>Cerrar todas las sesiones</Button>
        </div>
      </FormSection>

      <FormSection title="Preferencias" description="Afecta a formatos de fecha y moneda visibles en la app.">
        <div className="grid md:grid-cols-3 gap-3">
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Zona horaria</span>
            <Input value={prefs.tz ?? ""} onChange={e => setPrefs(v => ({ ...v, tz: e.target.value }))} placeholder="Europe/Madrid" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Formato de fecha</span>
            <select
              className="rounded-xl border p-2"
              value={prefs.dateFmt}
              onChange={e => setPrefs(v => ({ ...v, dateFmt: e.target.value as Prefs['dateFmt'] }))}
            >
              <option value="dd/mm/yyyy">dd/mm/yyyy</option>
              <option value="mm/dd/yyyy">mm/dd/yyyy</option>
            </select>
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-zinc-600">Moneda</span>
            <select
              className="rounded-xl border p-2"
              value={prefs.currency}
              onChange={e => setPrefs(v => ({ ...v, currency: e.target.value as Prefs['currency'] }))}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end">
          <Button onClick={savePrefs}>Guardar preferencias</Button>
        </div>
      </FormSection>

      <FormSection title="Privacidad y datos" description="Descarga tus datos o solicita baja.">
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportData} variant="secondary">Descargar mis datos (JSON)</Button>
          <span className="text-sm text-zinc-600 mt-2">
            Para eliminar la cuenta definitivamente se requiere acción del administrador (clave de servicio). Si lo necesitas, contáctanos.
          </span>
        </div>
      </FormSection>
    </div>
  );
}

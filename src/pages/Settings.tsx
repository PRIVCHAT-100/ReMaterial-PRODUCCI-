import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Building2, Globe, Mail, MapPin, Phone, Shield, User} from "lucide-react";

import { Badge } from "@/components/ui/badge";
type Profile = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  description?: string | null; // si usas "bio", cambia aquí y abajo

tax_id?: string | null;
logo_url?: string | null;
social_links?: string | null;
certifications?: string | null;
address_line1?: string | null;
city?: string | null;
province?: string | null;
postal_code?: string | null;
country?: string | null;
verification_status?: string | null;
};

export default function Settings()
{
  const { t } = useTranslation(); {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"account"|"company"|"notifications"|"security">("account");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Perfil
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<Profile>({
    id: "",
    email: "",
    first_name: "",
    last_name: "",
    company_name: "",
    phone: "",
    location: "",
    website: "",
    description: "",
  
tax_id: "",
logo_url: "",
social_links: "",
certifications: "",
address_line1: "",
city: "",
province: "",
postal_code: "",
country: "",
verification_status: "",
}
  );

  // Notificaciones (guardadas en user metadata para no depender de columnas nuevas)
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);
  const [notifyProductUpdates, setNotifyProductUpdates] = useState(true);

  // Seguridad
  const [newPassword, setNewPassword] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);

        // Perfil de la tabla profiles
        const { data: p, error: e } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (e) throw e;

        // Metadata de usuario (notificaciones)
        const { data: auth } = await supabase.auth.getUser();
        const md = auth.user?.user_metadata || {};

        if (!ignore) {
          setProfile(p);
          setForm({
            id: p.id,
            email: p.email ?? user.email ?? "",
            first_name: p.first_name ?? "",
            last_name: p.last_name ?? "",
            company_name: p.company_name ?? "",
            phone: p.phone ?? "",
            location: p.location ?? "",
            website: p.website ?? "",
            description: p.description ?? "",
          
tax_id: p.tax_id ?? "",
logo_url: p.logo_url ?? "",
social_links: p.social_links ?? "",
certifications: p.certifications ?? "",
address_line1: p.address_line1 ?? "",
city: p.city ?? "",
province: p.province ?? "",
postal_code: p.postal_code ?? "",
country: p.country ?? "",
verification_status: p.verification_status ?? "",
});
          setNotifyMessages(md.notifyMessages ?? true);
          setNotifyMarketing(md.notifyMarketing ?? false);
          setNotifyProductUpdates(md.notifyProductUpdates ?? true);
        }
      } catch (err) {
        console.error(err);
        toast({ title: "Error", description: "No se pudo cargar tu configuración", variant: "destructive" });
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => { ignore = true; };
  }, [user?.id, toast]);

  const saveProfile = async () => {
    if (!user?.id || !form) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name?.trim() || null,
          last_name: form.last_name?.trim() || null,
          company_name: form.company_name?.trim() || null,
          phone: form.phone?.trim() || null,
          location: form.location?.trim() || null,
          website: form.website?.trim() || null,
          description: form.description?.trim() || null,

tax_id: form.tax_id?.trim() || null,
logo_url: form.logo_url?.trim() || null,
social_links: form.social_links?.trim() || null,
certifications: form.certifications?.trim() || null,
address_line1: form.address_line1?.trim() || null,
city: form.city?.trim() || null,
province: form.province?.trim() || null,
postal_code: form.postal_code?.trim() || null,
country: form.country?.trim() || null,
// verification_status lo gestiona admin

        })
        .eq("id", user.id);
      if (error) throw error;

      toast({ title: "Guardado", description: "Tus datos se han actualizado." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo guardar el perfil.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    try {
      setSaving(true);
      await supabase.auth.updateUser({
        data: {
          notifyMessages,
          notifyMarketing,
          notifyProductUpdates,
        },
      });
      toast({ title: "Guardado", description: "Preferencias de notificación actualizadas." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudieron guardar las notificaciones.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast({ title: "Contraseña débil", description: "Debe tener mínimo 8 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== newPassword2) {
      toast({ title: "No coinciden", description: "Repite la nueva contraseña.", variant: "destructive" });
      return;
    }
    try {
      setChangingPass(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setNewPassword2("");
      toast({ title: "Contraseña actualizada", description: "Vuelve a iniciar sesión si se te solicita." });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudo cambiar la contraseña.", variant: "destructive" });
    } finally {
      setChangingPass(false);
    }
  };

  const disabled = loading || saving;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <h1 className="text-3xl font-bold">{t('ui.configuraci-n')}</h1>
          {profile?.company_name && (
            <Badge variant="secondary" className="ml-2">{profile.company_name}</Badge>
          )}
        </div>

        <div className="container mx-auto px-0 py-0">
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>{t ? t("interface_language") : "Idioma de la interfaz"}</CardTitle>
      <CardDescription>{t ? t("interface_language_desc") : "Selecciona el idioma de los textos predeterminados."}</CardDescription>
    </CardHeader>
    <CardContent>
      <LanguageSwitcher />
    </CardContent>
  </Card>
</div>

<Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Cuenta
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />{t('ui.empresa')}</TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" /> Notificaciones
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Seguridad
            </TabsTrigger>
          </TabsList>

          {/* Pestaña Cuenta */}
          {activeTab === "account" && (
            <Card>
              <CardHeader>
                <CardTitle>Datos de cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{t('ui.nombre')}</Label>
                    <Input
                      value={form.first_name || ""}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      placeholder={t('ui.tu-nombre')}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label>{t('ui.apellidos')}</Label>
                    <Input
                      value={form.last_name || ""}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      placeholder={t('ui.tus-apellidos')}
                      disabled={disabled}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input value={form.email || ""} disabled />
                    <p className="text-xs text-muted-foreground mt-1">{t('ui.el-email-se-gestiona-desde-tu-cuenta-si-necesitas-')}</p>
                  </div>
                </div>

                <Separator />
                <div className="flex justify-end gap-2">
                  <Button onClick={saveProfile} disabled={disabled} type="button">{t('ui.guardar-cambios')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pestaña Empresa */}
          {activeTab === "company" && (
            <Card>
              <CardHeader>
                <CardTitle>{t('ui.informaci-n-de-la-empresa')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>{t('ui.nombre-de-empresa')}</Label>
                    <Input
                      value={form.company_name || ""}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder={t('ui.mi-empresa-s-l')}
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />{t('ui.tel-fono')}</Label>
                    <Input
                      value={form.phone || ""}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+34 600 000 000"
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />{t('ui.ubicaci-n')}</Label>
                    <Input
                      value={form.location || ""}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder={t('ui.barcelona-espa-a')}
                      disabled={disabled}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" /> Web
                    </Label>
                    <Input
                      value={form.website || ""}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                      placeholder={t('ui.https-miempresa-com')}
                      disabled={disabled}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>{t('ui.descripci-n')}</Label>
                    <Textarea
                      value={form.description || ""}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder={t('ui.cu-ntanos-sobre-tu-empresa')}
                      className="min-h-[120px]"
                      disabled={disabled}
                    />
                  </div>
                </div>

                
<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <Label>CIF/NIF</Label>
    <Input
      value={form.tax_id || ""}
      onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
      placeholder="B12345678"
      disabled={disabled}
    />
  </div>
  <div>
    <Label>Dirección</Label>
    <Input
      value={form.address_line1 || ""}
      onChange={(e) => setForm({ ...form, address_line1: e.target.value })}
      placeholder="C/ Ejemplo, 123, 2ºB"
      disabled={disabled}
    />
  </div>
  <div>
    <Label>Ciudad</Label>
    <Input
      value={form.city || ""}
      onChange={(e) => setForm({ ...form, city: e.target.value })}
      placeholder="Barcelona"
      disabled={disabled}
    />
  </div>
  <div>
    <Label>Provincia</Label>
    <Input
      value={form.province || ""}
      onChange={(e) => setForm({ ...form, province: e.target.value })}
      placeholder="Barcelona"
      disabled={disabled}
    />
  </div>
  <div>
    <Label>Código Postal</Label>
    <Input
      value={form.postal_code || ""}
      onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
      placeholder="08001"
      disabled={disabled}
    />
  </div>
  <div>
    <Label>País</Label>
    <Input
      value={form.country || ""}
      onChange={(e) => setForm({ ...form, country: e.target.value })}
      placeholder="España"
      disabled={disabled}
    />
  </div>
  <div className="md:col-span-2">
    <Label>Logo URL</Label>
    <Input
      value={form.logo_url || ""}
      onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
      placeholder="https://..."
      disabled={disabled}
    />
  </div>
  <div className="md:col-span-2">
    <Label>Redes Sociales</Label>
    <Input
      value={form.social_links || ""}
      onChange={(e) => setForm({ ...form, social_links: e.target.value })}
      placeholder="https://linkedin.com/company/miempresa, https://instagram.com/miempresa"
      disabled={disabled}
    />
  </div>
  <div className="md:col-span-2">
    <Label>Certificaciones</Label>
    <Input
      value={form.certifications || ""}
      onChange={(e) => setForm({ ...form, certifications: e.target.value })}
      placeholder="ISO 9001, ISO 14001..."
      disabled={disabled}
    />
  </div>
</div>
<Separator />
                <div className="flex justify-end gap-2">
                  <Button onClick={saveProfile} disabled={disabled} type="button">{t('ui.guardar-cambios')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pestaña Notificaciones */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>{t('ui.preferencias-de-notificaci-n')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('ui.mensajes')}</p>
                    <p className="text-sm text-muted-foreground">{t('ui.recibir-alertas-cuando-te-env-en-un-mensaje')}</p>
                  </div>
                  <Switch checked={notifyMessages} onCheckedChange={setNotifyMessages} disabled={disabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Actualizaciones de producto</p>
                    <p className="text-sm text-muted-foreground">{t('ui.avisos-sobre-tus-productos-y-transacciones')}</p>
                  </div>
                  <Switch checked={notifyProductUpdates} onCheckedChange={setNotifyProductUpdates} disabled={disabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{t('ui.novedades-y-ofertas')}</p>
                    <p className="text-sm text-muted-foreground">{t('ui.correos-con-novedades-lanzamientos-o-promociones')}</p>
                  </div>
                  <Switch checked={notifyMarketing} onCheckedChange={setNotifyMarketing} disabled={disabled} />
                </div>

                <Separator />
                <div className="flex justify-end gap-2">
                  <Button onClick={saveNotifications} disabled={disabled} type="button">{t('ui.guardar-preferencias')}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pestaña Seguridad */}
          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>{t('ui.nueva-contrase-a')}</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={changingPass}
                  />
                  <Label>{t('ui.repetir-nueva-contrase-a')}</Label>
                  <Input
                    type="password"
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    placeholder="••••••••"
                    disabled={changingPass}
                  />
                  <div className="flex justify-end">
                    <Button onClick={changePassword} disabled={changingPass || !newPassword || !newPassword2} type="button">{t('ui.cambiar-contrase-a')}</Button>
                  </div>
                </div>

                <Separator />
                <div className="text-sm text-muted-foreground">{t('ui.pr-ximamente-verificaci-n-en-dos-pasos-2fa')}</div>
              </CardContent>
            </Card>
          )}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
}

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User, Building2, Bell, Shield, Globe, MapPin, Phone, Mail
} from "lucide-react";

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
};

export default function Settings() {
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
  });

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
          <h1 className="text-3xl font-bold">Configuración</h1>
          {profile?.company_name && (
            <Badge variant="secondary" className="ml-2">{profile.company_name}</Badge>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Cuenta
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> Empresa
            </TabsTrigger>
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
                    <Label>Nombre</Label>
                    <Input
                      value={form.first_name || ""}
                      onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      placeholder="Tu nombre"
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label>Apellidos</Label>
                    <Input
                      value={form.last_name || ""}
                      onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      placeholder="Tus apellidos"
                      disabled={disabled}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input value={form.email || ""} disabled />
                    <p className="text-xs text-muted-foreground mt-1">
                      El email se gestiona desde tu cuenta. Si necesitas cambiarlo, contáctanos.
                    </p>
                  </div>
                </div>

                <Separator />
                <div className="flex justify-end gap-2">
                  <Button onClick={saveProfile} disabled={disabled} type="button">Guardar cambios</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pestaña Empresa */}
          {activeTab === "company" && (
            <Card>
              <CardHeader>
                <CardTitle>Información de la empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label>Nombre de empresa</Label>
                    <Input
                      value={form.company_name || ""}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder="Mi Empresa S.L."
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" /> Teléfono
                    </Label>
                    <Input
                      value={form.phone || ""}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+34 600 000 000"
                      disabled={disabled}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" /> Ubicación
                    </Label>
                    <Input
                      value={form.location || ""}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Barcelona, España"
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
                      placeholder="https://miempresa.com"
                      disabled={disabled}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={form.description || ""}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Cuéntanos sobre tu empresa…"
                      className="min-h-[120px]"
                      disabled={disabled}
                    />
                  </div>
                </div>

                <Separator />
                <div className="flex justify-end gap-2">
                  <Button onClick={saveProfile} disabled={disabled} type="button">Guardar cambios</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pestaña Notificaciones */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de notificación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mensajes</p>
                    <p className="text-sm text-muted-foreground">
                      Recibir alertas cuando te envíen un mensaje.
                    </p>
                  </div>
                  <Switch checked={notifyMessages} onCheckedChange={setNotifyMessages} disabled={disabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Actualizaciones de producto</p>
                    <p className="text-sm text-muted-foreground">
                      Avisos sobre tus productos y transacciones.
                    </p>
                  </div>
                  <Switch checked={notifyProductUpdates} onCheckedChange={setNotifyProductUpdates} disabled={disabled} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novedades y ofertas</p>
                    <p className="text-sm text-muted-foreground">
                      Correos con novedades, lanzamientos o promociones.
                    </p>
                  </div>
                  <Switch checked={notifyMarketing} onCheckedChange={setNotifyMarketing} disabled={disabled} />
                </div>

                <Separator />
                <div className="flex justify-end gap-2">
                  <Button onClick={saveNotifications} disabled={disabled} type="button">Guardar preferencias</Button>
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
                  <Label>Nueva contraseña</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={changingPass}
                  />
                  <Label>Repetir nueva contraseña</Label>
                  <Input
                    type="password"
                    value={newPassword2}
                    onChange={(e) => setNewPassword2(e.target.value)}
                    placeholder="••••••••"
                    disabled={changingPass}
                  />
                  <div className="flex justify-end">
                    <Button onClick={changePassword} disabled={changingPass || !newPassword || !newPassword2} type="button">
                      Cambiar contraseña
                    </Button>
                  </div>
                </div>

                <Separator />
                <div className="text-sm text-muted-foreground">
                  Próximamente: Verificación en dos pasos (2FA).
                </div>
              </CardContent>
            </Card>
          )}
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}

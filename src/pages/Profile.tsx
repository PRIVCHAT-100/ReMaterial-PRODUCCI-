import React, { useState, useEffect } from "react";

import ProfileAvatar from "@/components/common/ProfileAvatar";
import BuyerProfileForm from "@/components/profile/BuyerProfileForm";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { useProfileRole } from "@/hooks/useProfileRole";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Globe, Phone, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const role = useProfileRole();
  if (role?.data && role.data.isAuthenticated && !role.data.isSeller) {
    return <Navigate to="/settings" replace />;
  }
  const { t } = useTranslation();

  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    company_name: "",
    first_name: "",
    last_name: "",
    phone: "",
    sector: "",
    location: "",
    description: "",
    tax_id: "",
    website: "",
    logo_url: "",
    social_links: "",
    certifications: "",
  });
  const [logoUploading, setLogoUploading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalFavorites: 0,
    totalSales: 0,
    rating: 4,
    reviews: 0,
  });

  useEffect(() => {
    if (!user) return;
    fetchProfile();
    fetchStats();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          company_name: data.company_name || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          sector: data.sector || "",
          location: data.location || "",
          description: data.description || "",
          tax_id: data.tax_id || "",
          website: data.website || "",
          logo_url: data.logo_url || "",
          social_links: data.social_links || "",
          certifications: data.certifications || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [{ data: products }, { data: favs }] = await Promise.all([
        supabase.from('products').select('id').eq('seller_id', user?.id),
        supabase.from('favorites').select('id').eq('user_id', user?.id),
      ]);

      setStats(prev => ({
        ...prev,
        totalProducts: products?.length || 0,
        totalFavorites: favs?.length || 0,
        reviews: Math.floor(Math.random() * 50) + 5,
      }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLogoUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `logos/${user.id}/${Date.now()}.${ext}`;
      // Usamos el bucket existente de product-images para no tocar nada más en el proyecto
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      setProfile((prev) => ({ ...prev, logo_url: data.publicUrl }));
      toast({
        title: 'Logo subido',
        description: 'Se ha generado la URL del logo. Pulsa "Guardar Cambios" para aplicarlo.',
      });
    } catch (err: any) {
      console.error('Error subiendo logo:', err);
      toast({
        title: 'Error subiendo logo',
        description: err?.message || 'No se pudo subir la imagen',
        variant: 'destructive',
      });
    } finally {
      setLogoUploading(false);
      e.currentTarget.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
// Garantiza que logo_url se guarde aunque updateProfile limite columnas
      try { await supabase.from('profiles').update({ logo_url: profile.logo_url }).eq('id', user?.id); } catch {}

      // Sincroniza nombre de empresa en perfiles + user_metadata para que se vea en el menú
      try {
        if (user?.id && profile.company_name) {
          await supabase.from('profiles').update({ company_name: profile.company_name }).eq('id', user.id);
          await supabase.auth.updateUser({ data: { company_name: profile.company_name } });
          // Opcional: avisar a quien escuche (Header/UserMenu) para refrescar
          window.dispatchEvent(new Event('profile:updated'));
        }
      } catch (e) { console.warn('No se pudo sincronizar company_name:', e); }

      toast({ title: 'Perfil actualizado' });
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Acceso Requerido</h2>
              <p className="text-muted-foreground">{t('ui.debes-iniciar-sesi-n-para-ver-tu-perfil')}</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Summary / Perfil a la izquierda */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ProfileAvatar className="h-12 w-12" src={ profile.logo_url } name={ profile.company_name || user?.email || "Perfil" } />
                  <div>
                    <h3 className="text-lg font-semibold">{profile.company_name || 'Mi Empresa'}</h3>
                    <Badge variant="secondary">{profile.sector || 'Sector'}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t('ui.miembro-desde')}: {new Date(user.created_at || Date.now()).toLocaleDateString()}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center mt-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.totalProducts}</div>
                    <div className="text-sm text-muted-foreground">{t('ui.productos')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.totalFavorites}</div>
                    <div className="text-sm text-muted-foreground">{t('ui.favoritos')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.totalSales}</div>
                    <div className="text-sm text-muted-foreground">Ventas</div>
                  </div>
                </div>
                <div className="flex items-center justify-center mt-4 gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= stats.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">({stats.reviews} reseñas)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('ui.informaci-n-de-la-empresa')}</CardTitle>
                <CardDescription>{t('ui.actualiza-la-informaci-n-de-tu-empresa-para-que-lo')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">{t('ui.nombre-de-la-empresa')}</Label>
                      <Input
                        id="company_name"
                        value={profile.company_name}
                        onChange={(e) => handleInputChange('company_name', e.target.value)}
                        placeholder="ReMaterial S.L."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sector">{t('ui.sector')}</Label>
                      <Select value={profile.sector} onValueChange={(v) => handleInputChange('sector', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('ui.selecciona-un-sector')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="construccion">{t('ui.construcci-n')}</SelectItem>
                          <SelectItem value="textil">Textil</SelectItem>
                          <SelectItem value="madera">{t('ui.madera')}</SelectItem>
                          <SelectItem value="metalurgia">Metalurgia</SelectItem>
                          <SelectItem value="piedra">{t('ui.piedra-y-m-rmol')}</SelectItem>
                          <SelectItem value="otros">{t('ui.otros')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t('ui.ubicaci-n')}</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder={t('ui.madrid-espa-a')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_id">CIF/NIF</Label>
                    <Input
                      id="tax_id"
                      value={profile.tax_id}
                      onChange={(e) => handleInputChange('tax_id', e.target.value)}
                      placeholder="B12345678"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">{t('ui.p-gina-web')}</Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder={t('ui.www-miempresa-com')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo_url">URL del Logo</Label>
                      <Input
                        id="logo_url"
                        value={profile.logo_url}
                        onChange={(e) => handleInputChange('logo_url', e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Subida directa desde archivo (opcional a la URL) */}
                  <div className="space-y-2">
                    <Label>Subir logo desde tu ordenador</Label>
                    <Input type="file" accept="image/*" onChange={handleLogoFileChange} disabled={logoUploading} />
                    <p className="text-xs text-muted-foreground">
                      Se guardará en almacenamiento y rellenará la URL automáticamente. Luego pulsa “Guardar Cambios”.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="social_links">Redes Sociales</Label>
                    <Input
                      id="social_links"
                      value={profile.social_links}
                      onChange={(e) => handleInputChange('social_links', e.target.value)}
                      placeholder="https://linkedin.com/company/miempresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certifications">Certificaciones</Label>
                    <Input
                      id="certifications"
                      value={profile.certifications}
                      onChange={(e) => handleInputChange('certifications', e.target.value)}
                      placeholder="ISO 9001, ISO 14001..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button type="submit" disabled={loading || logoUploading}>
                      {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
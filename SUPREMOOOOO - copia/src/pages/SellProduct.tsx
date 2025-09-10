import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileRole } from "@/hooks/useProfileRole";
import { supabase } from "@/integrations/supabase/client";
import { getBrowserLocation } from "@/utils/geolocate";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { productLimitFor } from "@/lib/billing/guards";
import { Upload, X, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SectorSubcategoryField, { SectorSubcategoryValue } from "@/components/forms/SectorSubcategoryField";
import SectorCascadeMenu, { SectorCascadeValue } from "@/components/forms/SectorCascadeMenu";

const SellProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: role } = useProfileRole();
  const [myCount, setMyCount] = useState<number>(0);
  const planLimit = productLimitFor(role?.plan as any);
  const overLimit = planLimit !== 'unlimited' && myCount >= (planLimit as number);

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('seller_id', user.id);
    setMyCount(count || 0);
  })(); }, []);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [sectorSel, setSectorSel] = useState<SectorCascadeValue>({ sector: "", subcategory: "" });
  const [sectorField, setSectorField] = useState<SectorSubcategoryValue>({
    sector: "",
    subcategory: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    unit: "kg",
    location: "",
    condition: "new",
    allow_direct_purchase: true,
    specifications: {} as Record<string, string>,
    shipping_available: false,
  });

  const categories = [
    { value: "construccion", label: "Construcción" },
    { value: "textil", label: "Textil" },
    { value: "madera", label: "Madera" },
    { value: "metalurgia", label: "Metalurgia" },
    { value: "piedra", label: "Piedra y Mármol" },
    { value: "plastico", label: "Plástico" },
    { value: "vidrio", label: "Vidrio" },
    { value: "otros", label: "Otros" },
  ];

  const units = [
    { value: "kg", label: "Kilogramos" },
    { value: "m2", label: "Metros cuadrados" },
    { value: "m3", label: "Metros cúbicos" },
    { value: "unidades", label: "Unidades" },
    { value: "metros", label: "Metros lineales" },
    { value: "litros", label: "Litros" },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) {
      toast({
        title: "Límite de imágenes",
        description: "Puedes subir máximo 8 imágenes",
        variant: "destructive",
      });
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (productId: string) => {
    const uploadedUrls = [] as string[];
    for (const image of images) {
      const fileName = `${productId}/${Date.now()}-${image.name}`;
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, image);
      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      uploadedUrls.push(urlData.publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (overLimit) { alert('Has alcanzado el límite de publicaciones de tu plan. Mejora tu plan para publicar más.'); return; }
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para publicar productos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create product
      const coords = await getBrowserLocation({ enableHighAccuracy: true, timeout: 10000 });
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          location: formData.location,
          condition: formData.condition,
          allow_direct_purchase: formData.allow_direct_purchase,
          specifications: formData.specifications,
          seller_id: user.id,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          status: 'active',
          // 🆕 FIX: guardar disponibilidad de envío
          shipping_available: formData.shipping_available,
        })
        .select()
        .single();

      if (productError) throw productError;

      // Upload images if any
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await uploadImages(product.id);
        await supabase
          .from('products')
          .update({ images: imageUrls })
          .eq('id', product.id);
      }

      toast({ title: "¡Producto publicado!", description: "Tu producto ha sido publicado exitosamente" });
      navigate(`/product/${product.id}`);
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo publicar el producto",
        variant: "destructive",
      });
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
              <p className="text-muted-foreground mb-4">Debes iniciar sesión para publicar productos.</p>
              <Button onClick={() => navigate('/')} type="button">
                Volver al inicio
              </Button>
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Publicar Producto</h1>
            <p className="text-muted-foreground">Añade tus materiales excedentes al marketplace</p>
          </div>

          {overLimit && (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-900 p-3 mb-4">
              Has alcanzado el límite de publicaciones de tu plan. <a className="underline" href="/plans">Mejorar plan</a>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription>Describe tu producto de manera clara y atractiva</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título del Producto*</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="ej. Recortes de mármol Carrara blanco"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción*</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe el material, su origen, calidad, dimensiones aproximadas..."
                      className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <SectorCascadeMenu
                        value={sectorSel}
                        onChange={(v) => {
                          setSectorSel(v);
                          // Compatibilidad total: guardamos la subcategoría en tu campo 'category'
                          handleInputChange("category", v.subcategory);
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="condition">Condición</Label>
                      <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Nuevo</SelectItem>
                          <SelectItem value="like_new">Como nuevo</SelectItem>
                          <SelectItem value="good">Buen estado</SelectItem>
                          <SelectItem value="used">Usado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing and Quantity */}
              <Card>
                <CardHeader>
                  <CardTitle>Precio y Cantidad</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio (€)*</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad*</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        placeholder="100"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit">Unidad</Label>
                      <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación*</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Madrid, España"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Imágenes</CardTitle>
                  <CardDescription>Añade hasta 8 imágenes de tu producto</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Haz clic para subir imágenes o arrastra y suelta
                        </p>
                      </label>
                    </div>

                    {images.length > 0 && (
                      <div>
                        {/* Carrusel: una imagen a la vez */}
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                          <img
                            src={URL.createObjectURL(images[(images.length ? Math.min(Math.max(carouselIndex, 0), images.length - 1) : 0)])}
                            alt={`Imagen ${(images.length ? Math.min(Math.max(carouselIndex, 0), images.length - 1) : 0)} + 1`}
                            className="absolute inset-0 h-full w-full object-cover"
                            draggable={false}
                          />
                          {images.length > 1 && (
                            <>
                              <button
                                type="button"
                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur px-2 py-2 border"
                                onClick={() => setCarouselIndex((prev) => (prev - 1 + images.length) % images.length)}
                                aria-label="Anterior"
                              >&lt;</button>
                              <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur px-2 py-2 border"
                                onClick={() => setCarouselIndex((prev) => (prev + 1) % images.length)}
                                aria-label="Siguiente"
                              >&gt;</button>
                              <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
                                {images.map((_, i) => (
                                  <span
                                    key={i}
                                    className={"h-1.5 w-1.5 rounded-full bg-white/50 " + (i === (images.length ? Math.min(Math.max(carouselIndex, 0), images.length - 1) : 0) ? "bg-white" : "")}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Venta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Permitir compra directa</Label>
                      <p className="text-sm text-muted-foreground">
                        Los compradores podrán comprar sin negociar
                      </p>
                    </div>
                    <Switch
                      checked={formData.allow_direct_purchase}
                      onCheckedChange={(checked) => handleInputChange('allow_direct_purchase', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="space-y-0.5">
                      <Label>Disponible para envíos</Label>
                      <p className="text-sm text-muted-foreground">
                        Indica si puedes enviar este producto
                      </p>
                    </div>
                    <Switch
                      checked={formData.shipping_available}
                      onCheckedChange={(checked) => handleInputChange('shipping_available', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || overLimit} className="flex-1">
                  {loading ? 'Publicando...' : 'Publicar Producto'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default SellProduct;

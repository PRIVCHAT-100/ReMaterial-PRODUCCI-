import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Trash2, Save, ArrowLeft } from "lucide-react";

type Product = {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number | string | null;
  quantity: number | null;
  unit: string | null;
  category: string | null;
  subcategory: string | null;
  location: string | null;
  images: string[] | null; // puede venir null
  created_at: string;
};

const BUCKET = "product-images";

export default function EditProduct() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const productFromState: Product | undefined = location?.state?.product;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");

  // Images
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [markedForRemoval, setMarkedForRemoval] = useState<Set<string>>(new Set());
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // hidratar formulario con un objeto producto
  const hydrate = (data: Product) => {
    setProduct(data);
    setTitle(data.title || "");
    setPrice(
      data.price != null && !Number.isNaN(Number(data.price)) ? String(data.price) : ""
    );
    setQuantity(
      data.quantity != null && !Number.isNaN(Number(data.quantity)) ? String(data.quantity) : ""
    );
    setUnit(data.unit || "");
    setCategory(data.category || "");
    setSubcategory(data.subcategory || "");
    setLocationText(data.location || "");
    setDescription(data.description || "");
    setCurrentImages(Array.isArray(data.images) ? (data.images as string[]) : []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) throw new Error("ID de producto inválido");

        // 1) Si viene por state (ProductDetail), precargamos al instante
        if (productFromState) {
          hydrate(productFromState);
          setLoading(false);
        }

        // 2) De todas formas, hacemos fetch para asegurar datos frescos / permisos
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        if (!data) throw new Error("Producto no encontrado");

        // Solo el propietario puede editar
        if (!user || data.seller_id !== user.id) {
          toast({
            title: "Sin permiso",
            description: "No puedes editar este producto",
            variant: "destructive",
          });
          navigate(`/products/${id}`);
          return;
        }

        // Si aún no habíamos hidratado o los datos difieren, hidratamos
        if (!productFromState || productFromState.updated_at !== data.updated_at) {
          hydrate(data as Product);
        }
      } catch (e: any) {
        console.error(e);
        toast({
          title: "Error",
          description: e?.message || "No se pudo cargar el producto",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const toggleRemove = (url: string) => {
    setMarkedForRemoval((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewFiles((prev) => [...prev, ...files]);
    e.currentTarget.value = "";
  };

  const uploadNewFiles = async (): Promise<string[]> => {
    if (!newFiles.length || !product) return [];
    const uploadedUrls: string[] = [];

    for (const file of newFiles) {
      const ext = file.name.split(".").pop();
      const filePath = `${product.id}/${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext || "jpg"}`;

      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      if (pub?.publicUrl) uploadedUrls.push(pub.publicUrl);
    }

    return uploadedUrls;
  };

  const finalImages = useMemo(() => {
    const kept = currentImages.filter((u) => !markedForRemoval.has(u));
    return kept;
  }, [currentImages, markedForRemoval]);

  const handleSave = async () => {
    try {
      if (!product || !user) return;

      const nPrice = price ? Number(price) : null;
      if (price && (!Number.isFinite(nPrice!) || nPrice! < 0)) {
        toast({ title: "Precio inválido", description: "Introduce un precio válido", variant: "destructive" });
        return;
      }
      const nQty = quantity ? Number(quantity) : null;
      if (quantity && (!Number.isFinite(nQty!) || nQty! < 0)) {
        toast({ title: "Cantidad inválida", description: "Introduce una cantidad válida", variant: "destructive" });
        return;
      }

      setSaving(true);

      const newUrls = await uploadNewFiles();
      const imagesToSave = [...finalImages, ...newUrls];

      const patch = {
        title: title.trim(),
        description: description.trim(),
        price: nPrice,
        quantity: nQty,
        unit: unit.trim() || null,
        category: category.trim() || null,
        subcategory: subcategory.trim() || null,
        location: locationText.trim() || null,
        images: imagesToSave,
        updated_at: new Date().toISOString(),
      };

      const { error: upErr } = await supabase
        .from("products")
        .update(patch)
        .eq("id", product.id);
      if (upErr) throw upErr;

      toast({ title: "Guardado", description: "El producto se actualizó correctamente" });
      navigate(`/products/${product.id}`);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: e?.message || "No se pudo guardar el producto", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded" />
              <div className="h-96 bg-muted rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">Editar producto</h1>
          </div>
          <Badge variant="secondary">ID: {product.id.slice(0, 8)}</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Imágenes */}
          <Card className="lg:col-span-1">
            <CardContent className="p-6">
              <h2 className="font-semibold mb-3">Imágenes</h2>

              {(currentImages?.length ?? 0) === 0 && (
                <p className="text-sm text-muted-foreground mb-3">Este producto no tiene imágenes.</p>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4">
                {currentImages?.map((url) => {
                  const marked = markedForRemoval.has(url);
                  return (
                    <div key={url} className="relative group">
                      <img
                        src={url}
                        alt="Producto"
                        className={`h-28 w-full object-cover rounded-lg border ${marked ? "opacity-40" : ""}`}
                      />
                      <Button
                        type="button"
                        variant={marked ? "default" : "destructive"}
                        size="icon"
                        className="absolute top-2 right-2 opacity-90"
                        onClick={() => toggleRemove(url)}
                        title={marked ? "Conservar imagen" : "Quitar imagen"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-images">Añadir nuevas imágenes</Label>
                <div className="flex items-center gap-2">
                  <Input id="new-images" type="file" accept="image/*" multiple onChange={onSelectFiles} />
                  <UploadCloud className="h-5 w-5 text-muted-foreground" />
                </div>
                {newFiles.length > 0 && (
                  <p className="text-xs text-muted-foreground">{newFiles.length} archivo(s) preparado(s) para subir</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Formulario */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Título</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del producto" />
                </div>
                <div>
                  <Label>Ubicación</Label>
                  <Input value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="Ciudad / Provincia" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Precio (€)</Label>
                  <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Cantidad</Label>
                  <Input inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Ej: 100" />
                </div>
                <div>
                  <Label>Unidad</Label>
                  <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="kg, m², unidad, etc." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="p. ej., 'madera', 'acero'…" />
                </div>
                <div>
                  <Label>Subcategoría</Label>
                  <Input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} placeholder="p. ej., 'palets', 'inox'…" />
                </div>
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Describe el material, estado, dimensiones, condiciones, etc."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => navigate(`/products/${product.id}`)} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

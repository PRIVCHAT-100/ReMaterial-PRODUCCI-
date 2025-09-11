import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useProfileRole } from "@/hooks/useProfileRole";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { productLimitFor } from "@/lib/billing/guards";
import {
  Package,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  Search,
  MapPin,
} from "lucide-react";

type Product = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  unit: string;
  images: string[] | null;
  location: string | null;
  category: string;
  status: string;
  created_at: string;
  is_visible?: boolean;
};

export default function MyProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: role } = useProfileRole();
  const planLimit = productLimitFor(role?.plan as any);
  const total = products?.length || 0;
  const overLimit = planLimit !== 'unlimited' && total >= (planLimit as number);
  const nearLimit = planLimit !== 'unlimited' && total >= (planLimit as number) - 2;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`id,title,price,quantity,unit,images,location,category,status,created_at,is_visible`)
        .eq("seller_id", user.id)
        .order("created_at", { ascending: false });
      if (!ignore) {
        if (error) {
          console.error(error);
          setProducts([]);
        } else {
          setProducts(data || []);
        }
        setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => {
      const hay = `${p.title ?? ""} ${p.category ?? ""} ${p.location ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [products, q]);

  const toggleVisibility = async (id: string, current: boolean | undefined) => {
    const next = !current;
    // Optimistic update
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_visible: next } : p)));
    const { error } = await supabase.from("products").update({ is_visible: next }).eq("id", id);
    if (error) {
      console.error(error);
      // revert
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_visible: current } : p)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar este producto? Esta acción no se puede deshacer.")) return;
    const prev = products;
    setProducts((p) => p.filter((x) => x.id !== id));
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error(error);
      setProducts(prev);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Mis productos</h1>
            <Badge variant="secondary">{products.length}</Badge>
          </div>
          <Button onClick={() => navigate('/sell')}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir producto
          </Button>
        </div>

        <div className="mb-6 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, categoría o ubicación..."
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No hay resultados</CardTitle>
            </CardHeader>
            <CardContent>Prueba con otro término o crea un nuevo producto.</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <Card key={p.id} className="group overflow-hidden cursor-pointer" onClick={() => navigate(`/product/${p.id}`)}>
                <CardHeader className="p-0 relative">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={p.images?.[0] ?? '/placeholder.png'}
                      alt={p.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!p.is_visible && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">Oculto</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{p.title}</h3>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{p.location || '—'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold">{p.price.toLocaleString('es-ES')}€</div>
                      <div className="text-xs text-muted-foreground">{p.quantity} {p.unit}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/edit/${p.id}`); }}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); toggleVisibility(p.id, p.is_visible); }}>
                        {p.is_visible !== false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

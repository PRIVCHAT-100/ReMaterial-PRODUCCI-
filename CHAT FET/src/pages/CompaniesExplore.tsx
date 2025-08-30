import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  MapPin,
  Building2,
  Factory,
  ShieldCheck,
  BadgeCheck,
  Globe,
  Heart,
  HeartOff,
  Filter,
  ListOrdered,
  Compass,
  ChevronRight,
} from "lucide-react";
import { MapContainer, TileLayer, Popup, CircleMarker } from "react-leaflet";
import { saveCoords, getCoords } from "@/utils/geo";
import "leaflet/dist/leaflet.css";
// ✅ Añadimos tu Header y tu Banner (ajusta las rutas si tu proyecto usa otras)
import Header from "@/components/Header";
import { geocodeAddress } from "@/utils/geocodeAddress";
import { supabase } from "@/integrations/supabase/client";

type Company = {
  id: string;
  name: string;
  sector?: string | null;
  city?: string | null;
  province?: string | null;
  address_line1?: string | null;
  postal_code?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  products?: number | null;
  verified?: boolean | null;
  certifications?: string[] | null;
  website?: string | null;
  size?: string | null;
  favorites?: number | null;
  logo_url?: string | null;
};

// -------------------------------------
// Utilidades
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const t1 = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const t2 = 2 * Math.atan2(Math.sqrt(t1), Math.sqrt(1 - t1));
  return R * t2;
}

// -------------------------------------
// Página principal
export default function CompaniesExplore() {
  const navigate = useNavigate();

  // Estado UI
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("Todos");
  const [size, setSize] = useState("todas");
  const [certs, setCerts] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(300);
  const [city, setCity] = useState("Barcelona");
  const [sortBy, setSortBy] = useState("relevance");
  const [view, setView] = useState<"grid" | "map" | "split">("split");
  const [favorites, setFavorites] = useState<string[]>([]);

  // Datos
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ubicación del usuario (por defecto BCN)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number }>(() => {
    const saved = getCoords();
    return saved ? saved : { lat: 41.3874, lng: 2.1686 };
  });

  // Carga desde Supabase (tabla profiles) sin filtros de servidor
  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) throw error;
        const rows = Array.isArray(data) ? data : [];

        // Filtrado en cliente por "is_seller" o "role === seller" si existen; si no, mostramos todos
        const onlySellers = rows.filter((r: any) => {
          if ("is_seller" in r) return r.is_seller === true || r.is_seller === "true" || r.is_seller === 1;
          if ("role" in r) return String(r.role).toLowerCase() === "seller";
          return true;
        });

        const mapped: Company[] = onlySellers.map((row: any) => ({
          id: row.id,
          name: row.company_name ?? row.full_name ?? row.name ?? "Empresa",
          sector: row.sector ?? null,
          city: row.city ?? null,
          province: row.province ?? null,
          address_line1: row.address_line1 ?? row.address ?? null,
          postal_code: row.postal_code ?? null,
          country: row.country ?? 'España',
          lat: typeof row.latitude === "string" ? parseFloat(row.latitude.replace(",", ".")) : (row.latitude ?? row.lat ?? null),
          lng: typeof row.longitude === "string" ? parseFloat(row.longitude.replace(",", ".")) : (row.longitude ?? row.lng ?? null),
          verified: row.verified ?? null,
          certifications: Array.isArray(row.certifications)
            ? row.certifications
            : (typeof row.certifications === "string"
              ? row.certifications.split(",").map((s: string) => s.trim()).filter(Boolean)
              : null),
          website: row.website ?? null,
          size: row.size ?? null,
          products: row.products_count ?? row.products ?? null,
          favorites: row.favorites ?? null,
          logo_url: row.logo_url ?? null,
        }));

        if (alive) setCompanies(mapped);
        // 🔎 Geocodificar en cliente empresas sin lat/lng (no rompe nada existente)
        (async () => {
          try {
            const needGeo = mapped.filter(c => (!c.lat || !c.lng) && (c.address_line1 || c.city || c.province || c.postal_code));
            if (needGeo.length === 0) return;

            const updated = [...mapped];
            for (const c of needGeo) {
              const address = [c.address_line1, c.postal_code, c.city, c.province, c.country].filter(Boolean).join(", ");
              try {
                const coords = await geocodeAddress(address);
                if (coords) {
                  const idx = updated.findIndex(x => x.id === c.id);
                  if (idx >= 0) {
                    updated[idx] = { ...updated[idx], lat: coords.lat, lng: coords.lng };
                  }
                  // Persistir de forma *opcional* si la tabla tiene columnas latitude/longitude
                  try {
                    // @ts-ignore - si no existen las columnas, Supabase ignorará o fallará silenciosamente según RLS
                    await supabase.from("profiles").update({ latitude: coords.lat, longitude: coords.lng }).eq("id", c.id);
                  } catch {}
                }
              } catch {}
            }
            if (alive) setCompanies(updated);
          } catch {}
        })();
        /* GEOCODE_MISSING */
    
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Error cargando empresas");
        console.error("[CompaniesExplore] error:", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Acciones
  const toggleFav = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleContact = (companyId: string) => {
    navigate(`/messages?seller=${companyId}`);
  };

  const handleViewProfile = (companyId: string) => {
    navigate(`/companies/${companyId}`);
  };

  const handleNearMe = () => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(coords);
        try { saveCoords(coords); } catch {}
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Listas dinámicas desde datos
  const allSectors = useMemo(
    () => ["Todos", ...Array.from(new Set(companies.map((c) => c.sector).filter(Boolean) as string[])).sort()],
    [companies]
  );

  const allCerts = useMemo(
    () => Array.from(new Set((companies.flatMap((c) => (c.certifications ?? [])) as string[]))).sort(),
    [companies]
  );

  const allSizes = [
    { value: "todas", label: "Todas" },
    { value: "pequeña", label: "Pequeña" },
    { value: "mediana", label: "Mediana" },
    { value: "grande", label: "Grande" },
  ];

  // Filtros + orden
  const filtered = useMemo(() => {
    let items = [...companies];

    if (q.trim()) {
      const qq = q.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(qq) ||
          (c.sector || "").toLowerCase().includes(qq) ||
          (c.city || "").toLowerCase().includes(qq)
      );
    }

    if (sector !== "Todos") items = items.filter((c) => c.sector === sector);
    if (size !== "todas") items = items.filter((c) => c.size === size);
    if (certs.length) items = items.filter((c) => certs.every((x) => (c.certifications || []).includes(x)));
    if (verifiedOnly) items = items.filter((c) => !!c.verified);

    // Radio desde userLoc solo si ordenamos por cercanía
    if (sortBy === "nearby") {
      items = items.filter((c) =>
        c.lat != null && c.lng != null ? haversineKm(userLoc, { lat: c.lat!, lng: c.lng! }) <= radiusKm : true
      );
    }

    items.sort((a, b) => {
      if (sortBy === "relevance") {
        const av = a.verified ? 1 : 0;
        const bv = b.verified ? 1 : 0;
        const ap = a.products ?? 0;
        const bp = b.products ?? 0;
        return bv - av || bp - ap;
      }
      if (sortBy === "nearby") {
        const da =
          a.lat != null && a.lng != null
            ? haversineKm(userLoc, { lat: a.lat, lng: a.lng })
            : Number.POSITIVE_INFINITY;
        const db =
          b.lat != null && b.lng != null
            ? haversineKm(userLoc, { lat: b.lat, lng: b.lng })
            : Number.POSITIVE_INFINITY;
        return da - db;
      }
      if (sortBy === "products") return (b.products ?? 0) - (a.products ?? 0);
      if (sortBy === "favorites") return (b.favorites ?? 0) - (a.favorites ?? 0);
      return 0;
    });

    return items;
  }, [companies, q, sector, size, certs, verifiedOnly, radiusKm, sortBy, userLoc]);

  return (
    <div className="container mx-auto px-4 pt-6">
      {/* ✅ Header global */}
      <Header />

      {/* Contenido de la página */}
      <div className="">
        {/* ✅ Tu banner arriba de Empresas (ajusta props si tu Banner las usa) */}
        <div className="relative lg:col-span-full">
  <a aria-label="hola" className="block group" href="/explore">
    <div className="relative w-full overflow-hidden rounded-2xl shadow-sm bg-muted">
      <img
        src="https://images.unsplash.com/photo-1581091014534-6c6821cc0f51?q=80&w=1600&auto=format&fit=crop"
        alt="hola"
        className="w-full h-[220px] sm:h-[320px] object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 sm:p-6 text-white">
        <h3 className="text-xl sm:text-2xl font-semibold drop-shadow">hola</h3>
      </div>
      <div className="absolute bottom-3 right-4 flex gap-2">
        <button aria-label="Ir al banner 1" className="h-2 w-2 rounded-full bg-white" />
        <button aria-label="Ir al banner 2" className="h-2 w-2 rounded-full bg-white/50" />
        <button aria-label="Ir al banner 3" className="h-2 w-2 rounded-full bg-white/50" />
        <button aria-label="Ir al banner 4" className="h-2 w-2 rounded-full bg-white/50" />
      </div>
    </div>
    <span className="absolute inset-0" />
  </a>
  <button aria-label="Anterior" className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full px-2 py-1">‹</button>
  <button aria-label="Siguiente" className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full px-2 py-1">›</button>
</div>

        {/* Título y acciones */}
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
            <p className="text-sm text-muted-foreground">Explora empresas por sector, ubicación, certificaciones y más.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filtros</Button>
            <Button variant="outline" className="gap-2" onClick={handleNearMe}><Compass className="h-4 w-4" /> Cerca de mí</Button>
            <Tabs value={view} onValueChange={(v: any) => setView(v)} className="hidden md:block">
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="map">Mapa</TabsTrigger>
                <TabsTrigger value="split">Split</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Búsqueda + orden */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="md:col-span-8 flex items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por nombre, sector o ciudad"
                className="pl-8"
              />
            </div>
            <Button variant="secondary" onClick={() => setQ("")}>Limpiar</Button>
          </div>
          <div className="md:col-span-4 flex items-center justify-end gap-2">
            <Label className="text-sm">Ordenar</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Relevancia" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevancia</SelectItem>
                <SelectItem value="nearby">Más cerca</SelectItem>
                <SelectItem value="products">Más productos</SelectItem>
                <SelectItem value="favorites">Más favoritas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Layout principal */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Filtros */}
          <aside className="md:col-span-3">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-base">Filtros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Ubicación + radio */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Ubicación base</Label>
                  <div className="relative">
                    <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ciudad o provincia" />
                    <Globe className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Radio</span>
                      <span>{radiusKm} km</span>
                    </div>
                    <Slider value={[radiusKm]} min={10} max={1000} step={10} onValueChange={(v) => setRadiusKm(v[0])} />
                  </div>
                </div>

                <Separator />

                {/* Sector */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2"><Factory className="h-4 w-4" /> Sector</Label>
                  <Select value={sector} onValueChange={setSector}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Sector" /></SelectTrigger>
                    <SelectContent>
                      {allSectors.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tamaño */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> Tamaño</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="w-full"><SelectValue placeholder="Tamaño" /></SelectTrigger>
                    <SelectContent>
                      {allSizes.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Certificaciones */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Certificaciones</Label>
                  <ScrollArea className="h-28 rounded border p-2">
                    <div className="space-y-2">
                      {allCerts.length === 0 && <div className="text-xs text-muted-foreground">Sin datos</div>}
                      {allCerts.map((c) => (
                        <div key={c} className="flex items-center gap-2">
                          <Checkbox
                            id={`cert-${c}`}
                            checked={certs.includes(c)}
                            onCheckedChange={(v) => {
                              const vv = Boolean(v);
                              setCerts((prev) => (vv ? [...prev, c] : prev.filter((x) => x !== c)));
                            }}
                          />
                          <Label htmlFor={`cert-${c}`} className="text-sm">{c}</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Verificadas */}
                <div className="flex items-center gap-2">
                  <Checkbox id="verified" checked={verifiedOnly} onCheckedChange={(v) => setVerifiedOnly(Boolean(v))} />
                  <Label htmlFor="verified" className="text-sm flex items-center gap-1"><BadgeCheck className="h-4 w-4" /> Solo verificadas</Label>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Resultados + mapa */}
          <section className="md:col-span-9">
            {/* Barra superior de resultados / tabs mobile */}
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="text-sm text-muted-foreground">
                {loading ? "Cargando..." : error ? "Error al cargar" : `${filtered.length} resultados`}
              </div>
              <div className="flex items-center gap-2 md:hidden">
                <Tabs value={view} onValueChange={(v: any) => setView(v)}>
                  <TabsList>
                    <TabsTrigger value="grid">Grid</TabsTrigger>
                    <TabsTrigger value="map">Mapa</TabsTrigger>
                    <TabsTrigger value="split">Split</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Vistas */}
            {view === "grid" && (
              <CompanyGrid
                items={filtered}
                onFav={toggleFav}
                favs={favorites}
                onContact={(id) => navigate(`/messages?seller=${id}`)}
                onView={(id) => navigate(`/companies/${id}`)}
              />
            )}

            {view === "map" && (
              <CompanyMap
                items={filtered}
                onContact={(id) => navigate(`/messages?seller=${id}`)}
                onView={(id) => navigate(`/companies/${id}`)}
              />
            )}

            {view === "split" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <CompanyGrid
                  items={filtered}
                  onFav={toggleFav}
                  favs={favorites}
                  compact
                  onContact={(id) => navigate(`/messages?seller=${id}`)}
                  onView={(id) => navigate(`/companies/${id}`)}
                />
                <CompanyMap
                  items={filtered}
                  onContact={(id) => navigate(`/messages?seller=${id}`)}
                  onView={(id) => navigate(`/companies/${id}`)}
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------
// Grid de empresas
function CompanyGrid({
  items,
  onFav,
  favs,
  compact = false,
  onContact,
  onView,
}: {
  items: Company[];
  onFav: (id: string) => void;
  favs: string[];
  compact?: boolean;
  onContact: (id: string) => void;
  onView: (id: string) => void;
}) {
  return (
      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>
      {items.map((c) => (
        <Card key={c.id} className="group overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {initials(c.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-base font-medium">{c.name}</h3>
                  {c.verified && (
                    <Badge variant="secondary" className="gap-1">
                      <BadgeCheck className="h-3 w-3" /> Verificada
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  {c.sector && (
                    <>
                      <span className="inline-flex items-center gap-1">
                        <Factory className="h-3 w-3" /> {c.sector}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  {(c.city || c.province) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {c.city}
                      {c.province ? ` (${c.province})` : ""}
                    </span>
                  )}
                  {c.products != null && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <ListOrdered className="h-3 w-3" /> {c.products} productos
                      </span>
                    </>
                  )}
                </div>
                {Array.isArray(c.certifications) && c.certifications.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.certifications.map((cc) => (
                      <Badge key={cc} variant="outline" className="text-[11px]">
                        {cc}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="gap-1" onClick={() => onView(c.id)}>
                      Ver perfil <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="gap-1" onClick={() => onContact(c.id)}>
                      Contactar <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant={favs.includes(c.id) ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => onFav(c.id)}
                    aria-label="Favorito"
                  >
                    {favs.includes(c.id) ? <Heart className="h-4 w-4" /> : <HeartOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {items.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No hay empresas que coincidan con los filtros.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// -------------------------------------
// Mapa de España con React-Leaflet
function CompanyMap({
  items,
  onContact,
  onView,
}: {
  items: Company[];
  onContact: (id: string) => void;
  onView: (id: string) => void;
}) {
  const spainBounds: [[number, number], [number, number]] = [[27.5, -18.5], [43.9, 4.6]];

  return (
      <Card className="h-[420px] overflow-hidden">
      <CardHeader className="p-4">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Mapa de España
        </CardTitle>
      </CardHeader>
      <CardContent className="relative h-full p-0">
        <div className="absolute inset-0">
          <MapContainer className="h-full w-full" bounds={spainBounds} scrollWheelZoom preferCanvas>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {items
              .filter((c) => c.lat != null && c.lng != null)
              .map((c) => (
                <CircleMarker key={c.id} center={[c.lat as number, c.lng as number]} radius={6}>
                  <Popup>
                    <div className="space-y-1">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.sector ? `${c.sector} • ` : ""}
                        {c.city}
                        {c.province ? ` (${c.province})` : ""}
                      </div>
                      {c.products != null && <div className="text-xs">{c.products} productos</div>}
                      {Array.isArray(c.certifications) && c.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {c.certifications.map((cc) => (
                            <span key={cc} className="rounded border px-1.5 py-0.5 text-[10px]">
                              {cc}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="pt-2 flex gap-2">
                        <Button variant="secondary" size="sm" className="h-7" onClick={() => onView(c.id)}>
                          Ver perfil
                        </Button>
                        <Button size="sm" className="h-7" onClick={() => onContact(c.id)}>
                          Contactar
                        </Button>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// -------------------------------------
// Helpers
function initials(name: string) {
  const parts = name.split(" ").filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
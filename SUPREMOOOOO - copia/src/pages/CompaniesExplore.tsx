import React, { useEffect, useMemo, useRef, useState } from "react";
// Reduce noisy logging in production to speed up dev tools and avoid blocking main thread
const VERBOSE_GEOCODE = false;
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
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
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
import { MapContainer, TileLayer, Popup, CircleMarker, Tooltip } from "react-leaflet";
import { saveCoords, getCoords } from "@/utils/geo";
import "leaflet/dist/leaflet.css";
// ✅ Añadimos tu Header y tu Banner (ajusta las rutas si tu proyecto usa otras)
import Header from "@/components/Header";
import { geocodeAddress } from "@/utils/geocodeAddress";

// Throttle helper for Nominatim (1 req/sec)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
import { SECTOR_VALUES } from "@/lib/constants/sectorValues";
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
  const [certsOnly, setCertsOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [radiusKm, setRadiusKm] = useState(300);
  const [city, setCity] = useState("Barcelona");
  const [sortBy, setSortBy] = useState("relevance");
  const [view, setView] = useState<"grid" | "map" | "split">("split");
  const [page, setPage] = useState(1);
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

  // Guard to avoid running the initial load twice in React StrictMode (dev)
  const didInitialLoad = useRef(false);


  // Carga desde Supabase (tabla profiles) sin filtros de servidor
  useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, company_name, sector, city, province, logo_url, location, address_line1, address_number, postal_code, country, latitude, longitude')
          .not('company_name', 'is', null)
          .or('is_seller.eq.true,is_seller.is.null');

        if (error) throw error;

        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.map((r: any) => ({
          id: r.id,
          name: r.company_name ?? '',
          sector: r.sector ?? null,
          city: r.city ?? null,
          province: r.province ?? null,
          logoUrl: r.logo_url ?? null,
          location: r.location ?? null,
          address_line1: r.address_line1 ?? null,
          address_number: r.address_number ?? null,
          postal_code: r.postal_code ?? null,
          country: r.country ?? null,
          lat: (typeof r.latitude === 'number') ? r.latitude : (typeof r.latitude === 'string' ? parseFloat(r.latitude) : null),
          lng: (typeof r.longitude === 'number') ? r.longitude : (typeof r.longitude === 'string' ? parseFloat(r.longitude) : null),
        })).filter((c: any) => !!c.name); // evita entradas vacías

        
        // Fallback: geocodificar si faltan coordenadas (basado en datos del vendedor)
        try {
          const toFix = mapped.filter((c: any) => (c.lat == null || c.lng == null) && (c.city || c.province));
          if (toFix.length) {
            const { geocodeAddress } = await import("@/utils/geocodeAddress");
            for (const c of toFix) {
              const line = [c.address_line1, c.address_number].filter(Boolean).join(" ");
              const full = [line, c.postal_code, c.city, c.province, c.country || "España"].filter(Boolean).join(", ");
              let coords = await geocodeAddress(full);
              if (!coords) {
                // second attempt with city + postal code
                const alt1 = [c.postal_code, c.city, c.country || 'España'].filter(Boolean).join(', ');
                coords = await geocodeAddress(alt1);
              }
              if (!coords) {
                // third attempt with street + city
                const alt2 = [line, c.city, c.country || 'España'].filter(Boolean).join(', ');
                coords = await geocodeAddress(alt2);
              }
              if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
                  // Ignore overly-generic centroid results (Spain center ~ 39.3261, -4.8380)
                  const nearSpainCentroid = Math.abs(coords.lat - 39.3261) < 0.05 && Math.abs(coords.lng + 4.8380) < 0.05;
                  if (nearSpainCentroid && (!c.city && !c.province && !c.address_line1 && !c.postal_code && !c.location)) {
                    if (VERBOSE_GEOCODE) console.warn('[CompaniesExplore] ignoring generic Spain centroid for', { id: c.id, name: c.name });
                  } else {
                  if (VERBOSE_GEOCODE) console.info('[CompaniesExplore] geocode success', { id: c.id, name: c.name, lat: coords.lat, lng: coords.lng });
                  // Persist coords so siguientes cargas no dependan del fallback
                  try {
                    // [SAFE PATCH] Disabled direct profile coords update in client to avoid RLS violations.
// await supabase.from('profiles').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', c.id)
// Use server-side function to persist coords for other users.;
                    if (VERBOSE_GEOCODE) console.info('[CompaniesExplore] persist coords ok', { id: c.id });
                  }
                  catch(perr) {
                    if (VERBOSE_GEOCODE) console.warn('[CompaniesExplore] persist coords fail', { id: c.id, err: perr });
                  }
                c.lat = coords.lat;
                c.lng = coords.lng;
              }
              } else {
                  if (VERBOSE_GEOCODE) console.warn('[CompaniesExplore] geocode failed', { id: c.id, name: c.name });
                }
            }
          }
        } catch(gerr) {
          console.warn("[CompaniesExplore] geocode fallback warn:", gerr);
        }

        console.info('[CompaniesExplore] data counts', { rows: rows.length, mapped: mapped.length, withCoords: mapped.filter((x:any)=>Number.isFinite(x.lat)&&Number.isFinite(x.lng)).length });
        
        // Fallback: geocodificar en cliente si no hay coordenadas en BD
        try {
          const needsGeo = mapped.filter((c: any) => (c.lat == null || c.lng == null) && (c.address_line1 || c.city || c.province || c.location));
          if (needsGeo.length) {
            const { geocodeAddress } = await import("@/utils/geocodeAddress");
            // Limitar para evitar bloqueo si hay muchas (ej. primeras 25)
            const candidates = needsGeo.slice(0, 25);
            for (const c of candidates) {
              // Construir dirección con múltiples alternativas
              const line1 = [c.address_line1, c.address_number].filter(Boolean).join(' ').trim();
              let fullAddr = [line1, c.postal_code, c.city, c.province, c.country || 'España'].filter(Boolean).join(', ');
              if (!fullAddr || fullAddr.replace(/[,\s]/g,'') === '') {
                // usar 'location' si existe
                if (c.location) fullAddr = String(c.location);
                // o al menos ciudad + país
                else if (c.city) fullAddr = [c.city, c.country || 'España'].join(', ');
                else if (c.province) fullAddr = [c.province, c.country || 'España'].join(', ');
              }
              if (VERBOSE_GEOCODE) console.info('[CompaniesExplore] geocode attempt', { id: c.id, name: c.name, full: fullAddr });
              const line = [c.address_line1, c.address_number].filter(Boolean).join(" ");
              const full = [line, c.postal_code, c.city, c.province, c.country || "España"].filter(Boolean).join(", ");
              try {
                let coords = await geocodeAddress(full);
              if (!coords) {
                // second attempt with city + postal code
                const alt1 = [c.postal_code, c.city, c.country || 'España'].filter(Boolean).join(', ');
                coords = await geocodeAddress(alt1);
              }
              if (!coords) {
                // third attempt with street + city
                const alt2 = [line, c.city, c.country || 'España'].filter(Boolean).join(', ');
                coords = await geocodeAddress(alt2);
              }
                if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
                  // Ignore overly-generic centroid results (Spain center ~ 39.3261, -4.8380)
                  const nearSpainCentroid = Math.abs(coords.lat - 39.3261) < 0.05 && Math.abs(coords.lng + 4.8380) < 0.05;
                  if (nearSpainCentroid && (!c.city && !c.province && !c.address_line1 && !c.postal_code && !c.location)) {
                    if (VERBOSE_GEOCODE) console.warn('[CompaniesExplore] ignoring generic Spain centroid for', { id: c.id, name: c.name });
                  } else {
                  if (VERBOSE_GEOCODE) console.info('[CompaniesExplore] geocode success', { id: c.id, name: c.name, lat: coords.lat, lng: coords.lng });
                  // Persist coords so siguientes cargas no dependan del fallback
                  try {
                    // [SAFE PATCH] Disabled direct profile coords update in client to avoid RLS violations.
// await supabase.from('profiles').update({ latitude: coords.lat, longitude: coords.lng }).eq('id', c.id)
// Use server-side function to persist coords for other users.;
                    if (VERBOSE_GEOCODE) console.info('[CompaniesExplore] persist coords ok', { id: c.id });
                  }
                  catch(perr) {
                    if (VERBOSE_GEOCODE) console.warn('[CompaniesExplore] persist coords fail', { id: c.id, err: perr });
                  }
                  c.lat = coords.lat;
                  c.lng = coords.lng;
                }
                }
              } catch {}
            }
          }
        } catch(gerr) {
          console.warn("[CompaniesExplore] geocode fallback warn:", gerr);
        }

        const withCoords = mapped.filter((x:any)=>Number.isFinite(x.lat)&&Number.isFinite(x.lng)).length;
        if (VERBOSE_GEOCODE) console.info('[CompaniesExplore] post-fallback coords', { withCoords });
        if (isMounted) setCompanies(mapped);


      } catch (e) {
        console.error('[CompaniesExplore] fetch error:', (e && (e.message || e.error_description || e.hint)) || e);
        if (isMounted) { setError((e as any)?.message ?? 'Error al cargar'); setCompanies([]); }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false };
  }, []);

  // Auto-geolocate disabled to base results only on vendor-provided addresses.


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
  const allSectors = useMemo(() => {
  const fromData = Array.from(new Set(companies.map((c) => c.sector).filter(Boolean))) as string[];
  const union = Array.from(new Set([...(SECTOR_VALUES || []), ...fromData]));
  return ["Todos", ...union];
}, [companies]);

  // Opciones de tamaño (derivadas de los datos) + opción 'todas'
  const allSizes = useMemo(() => {
    const uniq = Array.from(new Set(companies.map((c) => c.size).filter(Boolean))) as string[];
    return [{ value: "todas", label: "Todas" }, ...uniq.map((s) => ({ value: String(s), label: String(s) }))];
  }, [companies]);


  // Lista filtrada según búsqueda, sector, tamaño, certificaciones, verificación y radio
  const filtered = useMemo(() => {
    const qlc = (q || "").trim().toLowerCase();
    let items = companies.filter((c) => {
      // Búsqueda libre
      const hayTexto = !qlc || [
        c.name,
        c.sector,
        c.city,
        c.province,
      ].filter(Boolean).some((s) => String(s).toLowerCase().includes(qlc));

      // Sector
      const okSector = sector === "Todos" || (c.sector && c.sector === sector);

      // Tamaño
      const okSize = size === "todas" || (c.size && c.size === size);

      // Certificaciones
      const okCerts = !certsOnly || (Array.isArray(c.certifications) && c.certifications.length > 0);

      // Verificadas
      const okVerified = !verifiedOnly || !!c.verified;

      // Radio (si tenemos coords)
      const okRadio = (() => {
        if (!radiusKm || typeof c.lat !== "number" || typeof c.lng !== "number") return true;
        try {
          const d = haversineKm(userLoc, { lat: c.lat as number, lng: c.lng as number });
          return d <= radiusKm;
        } catch { return true; }
      })();

      return hayTexto && okSector && okSize && okCerts && okVerified && okRadio;
    });

    // Orden
    items.sort((a, b) => {
      if (sortBy === "nearby") {
        const da = (typeof a.lat === "number" && typeof a.lng === "number") ? haversineKm(userLoc, { lat: a.lat, lng: a.lng }) : Number.POSITIVE_INFINITY;
        const db = (typeof b.lat === "number" && typeof b.lng === "number") ? haversineKm(userLoc, { lat: b.lat, lng: b.lng }) : Number.POSITIVE_INFINITY;
        return da - db;
      }
      if (sortBy === "products") {
        const pa = (a.products ?? 0);
        const pb = (b.products ?? 0);
        return pb - pa;
      }
      if (sortBy === "favorites") {
        const fa = (a.favorites ?? 0);
        const fb = (b.favorites ?? 0);
        return fb - fa;
      }
      // relevance (default): no modificar orden original
      return 0;
    });

    return items;
  }, [companies, q, sector, size, certsOnly, verifiedOnly, radiusKm, sortBy, userLoc]);
  // Igual que 'filtered' pero sin filtro de radio (para ver todo en el mapa)
  const filteredNoRadius = useMemo(() => {
    const qlc = (q || "").trim().toLowerCase();
    let items = companies.filter((c) => {
      const hayTexto = !qlc || [c.name, c.sector, c.city, c.province].filter(Boolean).some((s) => String(s).toLowerCase().includes(qlc));
      const okSector = sector === "Todos" || (c.sector && c.sector === sector);
      const okSize = size === "todas" || (c.size && c.size === size);
      const okCerts = !certsOnly || !!c.certifications;
      const okVerified = !verifiedOnly || !!c.verified;
      return hayTexto && okSector && okSize && okCerts && okVerified;
    });
    // Mantener el mismo ordeneo seleccionado, pero sin radio
    items.sort((a, b) => {
      if (sortBy === "nearby") {
        return 0; // sin radio no priorizamos distancia
      }
      if (sortBy === "products") {
        return (b.products ?? 0) - (a.products ?? 0);
      }
      return 0;
    });
    return items;
  }, [companies, q, sector, size, certsOnly, verifiedOnly, sortBy]);



// Paginación (depende de 'filtered')
const pageSize = view === "split" ? 6 : 12;
const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
const currentPage = Math.min(page, totalPages);
const paginated = React.useMemo(() => {
  const start = (currentPage - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}, [filtered, currentPage, pageSize]);

// Reset page cuando cambian filtros o la vista
React.useEffect(() => { setPage(1); }, [q, sector, size, certsOnly, verifiedOnly, radiusKm, sortBy, view]);

  return (
    <div className="container mx-auto px-4 pt-6">
      {/* Header fijo como Explorar */}
      <div className="fixed top-0 inset-x-0 z-50 bg-white">
        <Header />
      </div>
      {/* Espaciador para evitar solape con el contenido */}
      <div className="h-16" />
      
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

      {/* Contenido de la página */}
      <div className="">
        {/* Título y acciones */}
        <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Empresas</h1>
            <p className="text-sm text-muted-foreground">Explora empresas por sector, ubicación, certificaciones y más.</p>
          </div>
          <div className="flex items-center gap-2">
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
              <SelectContent className="z-50">
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
                    <SelectContent className="z-50">
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
                    <SelectContent className="z-50">
                      {allSizes.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Certificaciones (Sí/No) */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Certificaciones</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox id="certs-only" checked={certsOnly} onCheckedChange={(vv) => setCertsOnly(Boolean(vv))} />
                    <Label htmlFor="certs-only" className="text-sm">Solo empresas con certificaciones</Label>
                  </div>
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
              <>
                <CompanyGrid
                  items={paginated}
                  onFav={toggleFav}
                  favs={favorites}
                  onContact={(id) => navigate(`/messages?seller=${id}`)}
                  onView={(id) => navigate(`/companies/${id}`)}
                />
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(n => (
                        <PaginationItem key={n}>
                          <PaginationLink href="#" isActive={n === currentPage} onClick={(e) => { e.preventDefault(); setPage(n); }}>{n}</PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}

            {view === "map" && (
              <CompanyMap
                items={filteredNoRadius}
                onContact={(id) => navigate(`/messages?seller=${id}`)}
                onView={(id) => navigate(`/companies/${id}`)}
              />
            )}

            {view === "split" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="flex flex-col">
                  <CompanyGrid
                    items={paginated}
                    onFav={toggleFav}
                    favs={favorites}
                    compact
                    onContact={(id) => navigate(`/messages?seller=${id}`)}
                    onView={(id) => navigate(`/companies/${id}`)}
                  />
                  <div className="mt-2">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(n => (
                          <PaginationItem key={n}>
                            <PaginationLink href="#" isActive={n === currentPage} onClick={(e) => { e.preventDefault(); setPage(n); }}>{n}</PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
                <CompanyMap
                  items={filteredNoRadius}
                  onContact={(id) => navigate(`/messages?seller=${id}`)}
                  onView={(id) => navigate(`/companies/${id}`)}
                />
              </div>
            )}</section>
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
                  {c.sector && <Badge variant="outline">{c.sector}</Badge>}
                  {c.city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.city}</span>}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => onContact(c.id)}>Contactar</Button>
                  <Button size="sm" variant="ghost" onClick={() => onView(c.id)}>Ver perfil</Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => onFav(c.id)}
                  >
                    {favs.includes(c.id) ? <HeartOff className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// -------------------------------------
// Mapa de empresas
function CompanyMap({ items, onContact, onView }: { items: Company[]; onContact: (id: string) => void; onView: (id: string) => void; }) {
  const center = { lat: 40.4168, lng: -3.7038 };
  const zoom = 5;
  return (
    <div className="h-[600px] w-full overflow-hidden rounded-lg border">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.filter((c) => c.lat != null && c.lng != null).map((c) => (
          <CircleMarker
            key={c.id}
            center={[c.lat as number, c.lng as number]}
            radius={5}
            fillOpacity={0.7}
            stroke={false}
          >
            <Tooltip permanent={false} direction="top" offset={[0, -10]} opacity={1}>
              <div className="max-w-[200px]">
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm">{c.sector}</p>
                <p className="text-xs">{c.city}</p>
                <div className="mt-1 flex gap-1">
                  <Button size="xs" onClick={() => onContact(c.id)}>Contactar</Button>
                  <Button size="xs" variant="outline" onClick={() => onView(c.id)}>Ver</Button>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

// -------------------------------------
// Utilidad: iniciales de un nombre
function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
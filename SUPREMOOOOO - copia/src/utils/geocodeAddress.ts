/**
 * Geocode an address string using Nominatim (OpenStreetMap).
 * Returns { lat, lng } or null on failure.
 * - Removes forbidden headers in browsers (no custom User-Agent).
 * - Adds caching (memory + localStorage).
 * - Retries with backoff, handles HTTP 429 (rate limiting).
 * - Increases timeout to 10s.
 */

function normalizeAddress(raw: string): string {
  try {
    let s = (raw || "").trim();

    // Replace common Spanish/Catalan street abbreviations at start
    s = s.replace(/^(C\/|C\.|Calle\s+|Carrer\s+|Av\.|Ave\.|Avenida\s+|Passeig\s+|Pg\.|Paseo\s+)/i, "");
    // Collapse whitespace and commas
    s = s.replace(/\s*,\s*/g, ", ").replace(/\s+/g, " ").trim();
    // Remove trailing commas
    s = s.replace(/,+$/g, "").trim();

    // If it's too generic (e.g., "España", "Spain"), return empty so caller can skip
    const lower = s.toLowerCase();
    if (lower === "españa" || lower === "spain") return "";

    // If too short, skip
    if (s.length < 8) return "";

    return s;
  } catch { return ""; }
}
const GEO_CACHE_KEY = "geo_cache_v1";
const geoMemCache: Map<string, { lat: number; lng: number }> = new Map();

function loadGeoCache(): Record<string, { lat: number; lng: number }> {
  try {
    const raw = localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") return obj;
  } catch {}
  return {};
}

function saveGeoCache(store: Record<string, { lat: number; lng: number }>) {
  try {
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(store));
  } catch {}
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const addr = normalizeAddress(address);
    if (!addr) return null;

    // memory cache first
    if (geoMemCache.has(addr)) return geoMemCache.get(addr)!;

    // localStorage cache second
    const cache = loadGeoCache();
    if (cache[addr]) {
      geoMemCache.set(addr, cache[addr]);
      return cache[addr];
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", addr);
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "0");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "es"); // priorizar España

    let delay = 500;
    for (let attempt = 0; attempt < 3; attempt++) {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 10000);
      try {
        const resp = await fetch(url.toString(), {
          headers: { "Accept": "application/json" }, // NO custom User-Agent (forbidden in browsers)
          signal: ctrl.signal
        });
        if (resp.status === 429) {
          // rate-limited; wait ~1.1s and retry
          await sleep(1100);
          continue;
        }
        if (!resp.ok) {
          await sleep(delay);
          delay = Math.min(delay * 2, 2000);
          continue;
        }
        const data = await resp.json().catch(() => null) as any;
        if (Array.isArray(data) && data.length) {
          const first = data[0];
          const lat = Number(first.lat);
          const lng = Number(first.lon);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            const coords = { lat, lng };
            // persist caches
            geoMemCache.set(addr, coords);
            cache[addr] = coords;
            saveGeoCache(cache);
            return coords;
          }
        }
        return null;
      } catch {
        await sleep(delay);
        delay = Math.min(delay * 2, 2000);
      } finally {
        try { clearTimeout(to); } catch {}
      }
    }
    return null;
  } catch {
    return null;
  }
}

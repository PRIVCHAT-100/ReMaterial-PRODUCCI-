
// src/utils/geocodeAddress.ts
// Geocodifica una dirección usando Nominatim (OpenStreetMap). Respeta su uso responsable.
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address || address.trim().length < 5) return null;

  // Cache básica en localStorage para evitar repetir llamadas
  const key = `geo_cache_${address}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed.lat === "number" && typeof parsed.lng === "number") {
        return parsed;
      }
    }
  } catch {}

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "es"); // priorizamos España

  const resp = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "User-Agent": "ReMaterial/1.0 (geocoding for placing company markers)"
    }
  });
  if (!resp.ok) return null;
  const data = await resp.json().catch(() => null);
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = data[0];
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!isFinite(lat) || !isFinite(lng)) return null;
  const coords = { lat, lng };
  try { localStorage.setItem(key, JSON.stringify(coords)); } catch {}
  return coords;
}

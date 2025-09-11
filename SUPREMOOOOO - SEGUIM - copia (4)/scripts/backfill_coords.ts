/**
 * Backfill script to geocode and persist coordinates for profiles missing latitude/longitude.
 * Usage:
 *  - Set env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *  - Run: ts-node scripts/backfill_coords.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL as string;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const supabase = createClient(url, key);

async function geocode(query: string) {
  const u = new URL("https://nominatim.openstreetmap.org/search");
  u.searchParams.set("q", query);
  u.searchParams.set("format", "json");
  u.searchParams.set("limit", "1");
  const res = await fetch(u.toString(), {
    headers: { "User-Agent": "rematerial/1.0 backfill" }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as any[];
  if (!Array.isArray(data) || data.length === 0) return null;
  const { lat, lon } = data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}

async function main() {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, street, number, city, province, zip, country")
    .is("latitude", null)
    .limit(5000);
  if (error) throw error;

  for (const p of profiles || []) {
    const parts = [p.street, p.number, p.city, p.province, p.zip, p.country].filter(Boolean).join(", ");
    if (!parts) continue;
    try {
      const coords = await geocode(parts);
      if (!coords) continue;
      const { error: upErr } = await supabase
        .from("profiles")
        .update({ latitude: coords.lat, longitude: coords.lng })
        .eq("id", p.id);
      if (upErr) {
        console.warn("Update failed for", p.id, upErr.message);
      } else {
        console.log("Updated", p.id, coords);
      }
      // be gentle with Nominatim
      await new Promise(r => setTimeout(r, 1100));
    } catch (e:any) {
      console.warn("Geocode failed for", p.id, e.message);
      await new Promise(r => setTimeout(r, 1500));
    }
  }
}
main().catch(e => {
  console.error(e);
  process.exit(1);
});

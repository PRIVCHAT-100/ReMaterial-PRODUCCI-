import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.1";

type Payload = {
  profile_id: string;
  address?: string; // optional; if not provided, read address fields from profile
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function geocode(query: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent": "rematerial/1.0 support@rematerial.app"
    }
  });
  if (!res.ok) throw new Error(`Geocode HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  const { lat, lon } = data[0];
  return { lat: parseFloat(lat), lng: parseFloat(lon) };
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }
    const payload = await req.json() as Payload;
    if (!payload?.profile_id) {
      return new Response(JSON.stringify({ error: "Missing profile_id" }), { status: 400 });
    }

    // read profile address if not provided
    let queryAddress = payload.address;
    if (!queryAddress) {
      const { data: prof, error } = await supabase
        .from("profiles")
        .select("street, number, city, province, zip, country")
        .eq("id", payload.profile_id)
        .single();
      if (error) throw error;
      const parts = [prof?.street, prof?.number, prof?.city, prof?.province, prof?.zip, prof?.country]
        .filter(Boolean)
        .join(", ");
      queryAddress = parts;
    }

    if (!queryAddress) {
      return new Response(JSON.stringify({ error: "No address to geocode" }), { status: 400 });
    }

    const coords = await geocode(queryAddress);
    if (!coords) {
      return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
    }

    const { error: upErr } = await supabase
      .from("profiles")
      .update({ latitude: coords.lat, longitude: coords.lng })
      .eq("id", payload.profile_id);

    if (upErr) throw upErr;

    return new Response(JSON.stringify({ ok: true, ...coords }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || String(e) }), { status: 500 });
  }
});

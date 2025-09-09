
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Integrations, ApiKey } from "@/lib/types/settings";

const DEFAULT: Integrations = {
  calendar_enabled: false,
  calendar_provider: "none",
  api_keys: [],
};

export function useIntegrations() {
  const [data, setData] = useState<Integrations>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [prefRes, keysRes] = await Promise.all([
        supabase.from("user_integrations").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_api_keys").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (!mounted) return;

      const pref = prefRes.data || {};
      setData({
        calendar_enabled: pref.calendar_enabled ?? false,
        calendar_provider: pref.calendar_provider ?? "none",
        api_keys: (keysRes.data ?? []).map((r: any) => ({
          id: r.id, name: r.name, token: r.token, scopes: r.scopes ?? [], created_at: r.created_at
        })) as ApiKey[],
      });
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function saveBasics(next: Pick<Integrations, "calendar_enabled" | "calendar_provider">) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = { user_id: user.id, ...next };
    const { error } = await supabase.from("user_integrations").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) throw error;
    setData(d => ({ ...d, ...next }));
  }

  async function createApiKey(name: string, token: string, scopes: string[]) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from("user_api_keys")
      .insert({ user_id: user.id, name, token, scopes })
      .select("*")
      .single();
    if (error) throw error;
    setData(d => ({ ...d, api_keys: [{ id: inserted.id, name, token, scopes: scopes as any, created_at: inserted.created_at }, ...d.api_keys] }));
  }

  async function revokeApiKey(id: string) {
    const { error } = await supabase.from("user_api_keys").delete().eq("id", id);
    if (error) throw error;
    setData(d => ({ ...d, api_keys: d.api_keys.filter(k => k.id !== id) }));
  }

  return { data, setData, loading, saving, saveBasics, createApiKey, revokeApiKey };
}

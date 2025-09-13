
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { UserPreferences, OfferTemplate } from "@/lib/types/settings";

const DEFAULT: UserPreferences = {
  language: "es",
  fallback_language: "es",
  default_unit: "u",
  default_shipping_available: true,
  default_min_stock: 1,
  offer_templates: [],
};

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("user_settings_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (!error && data) {
        setPrefs({
          language: data.language ?? "es",
          fallback_language: data.fallback_language ?? "es",
          default_unit: data.default_unit ?? "u",
          default_shipping_available: data.default_shipping_available ?? true,
          default_min_stock: data.default_min_stock ?? 1,
          offer_templates: (data.offer_templates ?? []) as OfferTemplate[],
        });
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function save(next: UserPreferences) {
    setSaving(true);
    setPrefs(next);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = {
      user_id: user.id,
      language: next.language,
      fallback_language: next.fallback_language,
      default_unit: next.default_unit,
      default_shipping_available: next.default_shipping_available,
      default_min_stock: next.default_min_stock,
      offer_templates: next.offer_templates,
    };
    const { error } = await supabase
      .from("user_settings_preferences")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) throw error;
  }

  return { prefs, setPrefs, save, loading, saving };
}

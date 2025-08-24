
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { A11yAppearance } from "@/lib/types/settings";

const DEFAULT: A11yAppearance = {
  theme: "system",
  font_size: "medium",
  high_contrast: false,
  reduce_motion: false,
  table_density: "comfortable",
};

export function useA11yAppearance() {
  const [prefs, setPrefs] = useState<A11yAppearance>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("user_settings_accessibility")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (!error && data) {
        setPrefs({
          theme: data.theme ?? "system",
          font_size: data.font_size ?? "medium",
          high_contrast: data.high_contrast ?? false,
          reduce_motion: data.reduce_motion ?? false,
          table_density: data.table_density ?? "comfortable",
        });
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function save(next: A11yAppearance) {
    setSaving(true);
    setPrefs(next);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = { user_id: user.id, ...next };
    const { error } = await supabase.from("user_settings_accessibility").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) throw error;
  }

  return { prefs, setPrefs, save, loading, saving };
}

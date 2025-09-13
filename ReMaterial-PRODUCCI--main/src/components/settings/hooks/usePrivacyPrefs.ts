import { useEffect, useState } from "react";
import type { PrivacyPrefs, ContactPermission } from "@/lib/types/settings";
import { supabase } from "@/lib/supabase/client"; // instancia única

const DEFAULT: PrivacyPrefs = {
  who_can_contact: "all",
  blocklist: [],
  show_last_seen: true,
  consent_analytics: true,
  consent_cookies: true,
};

export function usePrivacyPrefs() {
  const [prefs, setPrefs] = useState<PrivacyPrefs>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("user_settings_privacy")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (!error && data) {
        setPrefs({
          who_can_contact: (data.who_can_contact ?? "all") as ContactPermission,
          blocklist: data.blocklist ?? [],
          show_last_seen: data.show_last_seen ?? true,
          consent_analytics: data.consent_analytics ?? true,
          consent_cookies: data.consent_cookies ?? true,
        });
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function save(next: PrivacyPrefs) {
    setSaving(true);
    setPrefs(next);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = {
      user_id: user.id,
      who_can_contact: next.who_can_contact,
      blocklist: next.blocklist,
      show_last_seen: next.show_last_seen,
      consent_analytics: next.consent_analytics,
      consent_cookies: next.consent_cookies,
    };
    const { error } = await supabase
      .from("user_settings_privacy")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) throw error;
  }

  return { prefs, setPrefs, save, loading, saving };
}

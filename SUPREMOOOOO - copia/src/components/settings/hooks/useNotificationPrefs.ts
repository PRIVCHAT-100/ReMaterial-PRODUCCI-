import { useEffect, useState } from "react";
import type { NotificationPrefs, Frequency } from "@/lib/types/settings";
import { supabase } from "@/lib/supabase/client"; // instancia única

const DEFAULT: NotificationPrefs = {
  channels: { email: true, web_push: false },
  types: { messages: true, offers: true, favorites: true, product_state: true, system: true },
  frequency: "immediate",
  muted_conversation_ids: [],
  weekly_digest: false,
};

export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("user_settings_notifications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!mounted) return;
      if (!error && data) {
        setPrefs({
          channels: { email: data.channel_email ?? true, web_push: data.channel_web_push ?? false },
          types: {
            messages: data.type_messages ?? true,
            offers: data.type_offers ?? true,
            favorites: data.type_favorites ?? true,
            product_state: data.type_product_state ?? true,
            system: data.type_system ?? true,
          },
          frequency: (data.frequency ?? "immediate") as Frequency,
          muted_conversation_ids: data.muted_conversation_ids ?? [],
          weekly_digest: data.weekly_digest ?? false,
        });
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function save(next: NotificationPrefs) {
    setSaving(true);
    setPrefs(next);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = {
      user_id: user.id,
      channel_email: next.channels.email,
      channel_web_push: next.channels.web_push,
      type_messages: next.types.messages,
      type_offers: next.types.offers,
      type_favorites: next.types.favorites,
      type_product_state: next.types.product_state,
      type_system: next.types.system,
      frequency: next.frequency,
      muted_conversation_ids: next.muted_conversation_ids,
      weekly_digest: next.weekly_digest,
    };
    const { error } = await supabase
      .from("user_settings_notifications")
      .upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) throw error;
  }

  return { prefs, setPrefs, save, loading, saving };
}

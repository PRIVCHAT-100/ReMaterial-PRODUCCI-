
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { SupportLegal, SupportTicket } from "@/lib/types/settings";

const DEFAULT: SupportLegal = {
  legal: { terms_version: null, privacy_version: null, accepted_at: null },
  tickets: [],
};

export function useSupportLegal() {
  const [data, setData] = useState<SupportLegal>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [legalRes, ticketsRes] = await Promise.all([
        supabase.from("user_legal_acceptance").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (!mounted) return;
      const legal = legalRes.data || {};
      setData({
        legal: {
          terms_version: legal.terms_version ?? null,
          privacy_version: legal.privacy_version ?? null,
          accepted_at: legal.accepted_at ?? null,
        },
        tickets: (ticketsRes.data ?? []).map((r: any) => ({
          id: r.id, subject: r.subject, message: r.message, status: r.status, created_at: r.created_at
        })) as SupportTicket[],
      });
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  async function acceptLegal(terms_version: string, privacy_version: string) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    const payload = { user_id: user.id, terms_version, privacy_version, accepted_at: new Date().toISOString() };
    const { error } = await supabase.from("user_legal_acceptance").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) throw error;
    setData(d => ({ ...d, legal: { ...payload } }));
  }

  async function createTicket(subject: string, message: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: inserted, error } = await supabase
      .from("support_tickets").insert({ user_id: user.id, subject, message, status: "open" }).select("*").single();
    if (error) throw error;
    setData(d => ({ ...d, tickets: [{ id: inserted.id, subject, message, status: inserted.status, created_at: inserted.created_at }, ...d.tickets] }));
  }

  return { data, setData, loading, saving, acceptLegal, createTicket };
}

// src/lib/auth/autoPlanRedirect.ts
// Optional: import this once (e.g., in src/main.tsx) to redirect new users to the plan wizard.
import { supabase } from "@/lib/supabase/client";

let initialized = false;

export function initAutoPlanRedirect() {
  if (initialized) return;
  initialized = true;

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
      try {
        const { data } = await supabase
          .from("billing_subscriptions")
          .select("plan_tier,status")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const tier = data?.plan_tier || "free";
        const status = data?.status || "inactive";

        // If brand new (no active sub), push to onboarding
        if (tier === "free" || status === "inactive") {
          // Avoid redirect if we're already on onboarding or billing
          if (!location.pathname.startsWith("/onboarding/plan") && !location.pathname.startsWith("/settings/billing")) {
            window.location.href = "/onboarding/plan";
          }
        }
      } catch {}
    }
  });
}

initAutoPlanRedirect();
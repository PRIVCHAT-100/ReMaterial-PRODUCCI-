
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AuthGate({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      await supabase.auth.getSession(); // hydrate from localStorage before first render
      if (mounted) setReady(true);
    })();
    return () => { mounted = false; };
  }, []);
  if (!ready) return <>{fallback}</>;
  return <>{children}</>;
}

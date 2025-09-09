import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type RoleState = {
  loading: boolean;
  isBuyer: boolean;
  isSeller: boolean;
  role: "buyer" | "seller" | null;
};

export function useUserRole(): RoleState {
  const { user } = useAuth() as any;
  const [state, setState] = useState<RoleState>({
    loading: !!user,
    isBuyer: false,
    isSeller: false,
    role: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) {
        setState({ loading: false, isBuyer: false, isSeller: false, role: null });
        return;
      }
      setState((s) => ({ ...s, loading: true }));
      const { data, error } = await supabase
        .from("profiles")
        .select("is_buyer, is_seller, role")
        .eq("id", user.id)
        .single();

      if (cancelled) return;

      if (error) {
        // Fallback to any role attached to user object
        const isSeller = Boolean(user?.profile?.is_seller ?? user?.is_seller ?? (user?.role === "seller"));
        const isBuyer  = Boolean(user?.profile?.is_buyer  ?? user?.is_buyer  ?? (user?.role === "buyer"));
        setState({ loading: false, isBuyer, isSeller, role: isSeller ? "seller" : (isBuyer ? "buyer" : null) });
        return;
      }

      const isSeller = !!data?.is_seller || data?.role === "seller";
      const isBuyer  = !!data?.is_buyer  || data?.role === "buyer";

      setState({ loading: false, isBuyer, isSeller, role: isSeller ? "seller" : (isBuyer ? "buyer" : null) });
    }

    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  return useMemo(() => state, [state.loading, state.isBuyer, state.isSeller, state.role]);
}

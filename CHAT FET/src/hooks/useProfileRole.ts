import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ProfileRow = { id: string; is_seller?: boolean | null };

export function useProfileRole() {
  return useQuery({
    queryKey: ["profile-role"],
    queryFn: async () => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) return { isAuthenticated: false, isSeller: false };

      const { data, error } = await supabase
        .from("profiles")
        .select("id,is_seller")
        .eq("id", user.id)
        .maybeSingle(); // tolera ausencia de fila

      if (error) throw error;
      return { isAuthenticated: true, isSeller: !!data?.is_seller };
    },
    staleTime: 60_000,
  });
}

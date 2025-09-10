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
        .select("id,is_seller,plan,plan_status")
        .eq("id", user.id)
        .maybeSingle(); // tolera ausencia de fila

      if (error) throw error;
      return { isAuthenticated: true, isSeller: !!data?.is_seller, plan: data?.plan || null, planStatus: (data as any)?.plan_status || 'active' };
    },
    staleTime: 60_000,
  });
}

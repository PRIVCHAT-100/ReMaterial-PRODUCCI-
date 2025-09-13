import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useProfileRole() {
  return useQuery({
    queryKey: ['profile-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAuthenticated: false, isSeller: false, plan: null as string|null, planStatus: 'inactive' };

      let { data, error } = await supabase
        .from('profiles')
        .select('id,is_seller,plan,plan_status')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      // Si no existe fila de profiles, la creamos mínima
      if (!data) {
        const { error: insErr } = await supabase
          .from('profiles')
          .insert({ id: user.id, is_seller: false })
          .select('id,is_seller,plan,plan_status')
          .maybeSingle();
        if (insErr) {
          // tolera fallo de RLS; devolvemos estado sin seller
          return { isAuthenticated: true, isSeller: false, plan: null as any, planStatus: 'inactive' };
        }
        // volver a leer
        const { data: again } = await supabase
          .from('profiles')
          .select('id,is_seller,plan,plan_status')
          .eq('id', user.id)
          .maybeSingle();
        data = again || null as any;
      }

      return {
        isAuthenticated: true,
        isSeller: !!data?.is_seller,
        plan: (data?.plan as string|null) || null,
        planStatus: (data?.plan_status as string|null) || 'inactive',
      };
    },
    staleTime: 60_000,
  });
}

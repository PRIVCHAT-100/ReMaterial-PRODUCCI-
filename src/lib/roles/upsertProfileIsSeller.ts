import { supabase } from "@/integrations/supabase/client";

export async function upsertProfileIsSeller(userId: string, email: string | null, isSeller: boolean) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, email, is_seller: isSeller }, { onConflict: "id" });
  if (error) throw error;
}

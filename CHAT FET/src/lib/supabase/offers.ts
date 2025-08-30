import type { Offer } from "@/types/marketplace";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Versión estricta: garantiza buyer_id antes de hacer el insert.
 * - Falla *antes* si no hay sesión.
 * - Loguea el payload para depurar.
 */
export async function createOfferWithProduct({
  supabase,
  productId,
  price,
  note,
  sellerId,
}: {
  supabase: SupabaseClient;
  productId: string;
  price: number;
  note?: string;
  sellerId?: string;
}): Promise<{ data: Offer | null; error: any | null }> {
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr) return { data: null, error: authErr };
    const user = authData?.user;
    if (!user?.id) {
      return { data: null, error: new Error("No hay sesión activa: buyer_id no puede ser null") };
    }

    const payload: any = {
      product_id: productId,
      buyer_id: user.id,
      price,
      note,
      status: "pending",
    };
    if (sellerId) payload.seller_id = sellerId;

    // Log de depuración (puedes quitarlo en producción)
    console.debug("[createOfferWithProduct] payload:", payload);

    const { data, error } = await supabase
      .from("offers")
      .insert(payload)
      .select("*")
      .single();

    if (error) return { data: null, error };
    return { data: data as Offer, error: null };
  } catch (e: any) {
    return { data: null, error: e };
  }
}

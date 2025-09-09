import { supabase } from "@/integrations/supabase/client";

export async function getAvailableQuantity(productId: string): Promise<number> {
  // Primero obtener el inventario total del producto
  const { data: product, error } = await supabase
    .from("products")
    .select("inventory, stock")
    .eq("id", productId)
    .single();

  if (error) throw error;
  
  const totalInventory = product?.inventory || product?.stock || 0;

  // Obtener la suma de todas las reservas activas para este producto
  const { data: reservations, error: reservationError } = await supabase
    .from("offers")
    .select("reserved_quantity")
    .eq("product_id", productId)
    .eq("reserved", true)
    .eq("status", "accepted");

  if (reservationError) throw reservationError;

  const totalReserved = reservations?.reduce((sum, offer) => sum + (offer.reserved_quantity || 0), 0) || 0;

  return Math.max(0, totalInventory - totalReserved);
}

export async function getProductReservations(productId: string): Promise<{
  totalReserved: number;
  reservations: Array<{
    quantity: number;
    price?: number;
    createdAt: string;
  }>;
}> {
  const { data, error } = await supabase
    .from("offers")
    .select("reserved_quantity, reserved_price, created_at")
    .eq("product_id", productId)
    .eq("reserved", true)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const totalReserved = data?.reduce((sum, offer) => sum + (offer.reserved_quantity || 0), 0) || 0;
  
  return {
    totalReserved,
    reservations: data?.map(offer => ({
      quantity: offer.reserved_quantity || 0,
      price: offer.reserved_price || undefined,
      createdAt: offer.created_at
    })) || []
  };
}
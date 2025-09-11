import { supabase } from "@/lib/supabase/client";

export type ProductSnapshot = {
  name: string;         // products.name
  unit: string;         // products.unit
  pricePerUnit: number; // products.price
  location: string;     // products.location
  inventory: number;    // products.inventory
  sellerName: string;   // optional from profiles
};

export async function fetchProductSnapshot(productId: string): Promise<ProductSnapshot | null> {
  if (!productId) return null;

  const { data: prod, error } = await supabase
    .from("products")
    .select("name, unit, price, location, inventory, seller_id")
    .eq("id", productId)
    .single();

  if (error || !prod) return null;

  let sellerName = "—";
  if (prod.seller_id) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name, username, company_name")
      .eq("id", prod.seller_id)
      .maybeSingle();
    sellerName = (prof?.company_name || prof?.full_name || prof?.username || "—") as string;
  }

  return {
    name: (prod.name ?? "—") as string,
    unit: (prod.unit ?? "ud") as string,
    pricePerUnit: Number(prod.price ?? 0),
    location: (prod.location ?? "—") as string,
    inventory: Number((prod.inventory ?? 0) as number),
    sellerName,
  };
}

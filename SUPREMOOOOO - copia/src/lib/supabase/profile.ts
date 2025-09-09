import { supabase } from "@/lib/supabase/client";

/**
 * Carga un perfil por id con un select seguro. Evita 400 si pides columnas inexistentes.
 * Si ya conoces las columnas reales, cámbialas en la constante SAFE_COLUMNS.
 */
const SAFE_COLUMNS = "*"; // o: "id,email,is_seller,company_name,phone,website,avatar_url"

export async function getProfileById(userId: string) {
  if (!userId) throw new Error("getProfileById: userId requerido");
  const { data, error } = await supabase
    .from("profiles")
    .select(SAFE_COLUMNS)
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

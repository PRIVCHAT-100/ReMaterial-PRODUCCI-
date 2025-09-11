
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

declare global {
  // eslint-disable-next-line no-var
  var __supabase__: SupabaseClient | undefined;
}

const buildClient = (): SupabaseClient => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
    },
  });
};

export const supabase: SupabaseClient = (globalThis.__supabase__ ??= buildClient());
export default supabase;

// Supabase client: robusto con .env y logs
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Soporta ambos nombres por compatibilidad
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY
  ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY; // fallback si tu .env usaba este nombre

// Logs de diagnóstico
console.log("[Supabase] URL:", SUPABASE_URL);
console.log("[Supabase] KEY (10 primeros):", SUPABASE_PUBLISHABLE_KEY?.slice(0, 10));

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("[Supabase] FALTAN variables .env -> revisa .env.local en la RAÍZ del proyecto");
}

// Crea el cliente: si no hay sesión de usuario, usa JWT de la anon key.
export const supabase = createClient<Database>(
  SUPABASE_URL!,
  SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
    // Nota: supabase-js añade Authorization y apikey automáticamente
  }
);

// @ts-ignore - helper para probar desde la consola del navegador
window.__sb = supabase;

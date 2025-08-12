// Centralizado: cliente Supabase (con variables de entorno)
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Usa variables de entorno de Vite. Si no existen, cae al proyecto nuevo por defecto.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://eadocusarxgjbxuwiune.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_PUBLISHABLE_KEY) {
  console.warn('[Supabase] Falta VITE_SUPABASE_ANON_KEY en .env.local');
}

// Importa el cliente así:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente anónimo SIN cookies, para lecturas públicas cacheables (la carta).
 * Apto para usar dentro de unstable_cache (no depende de la request).
 * RLS permite leer la carta activa de forma anónima.
 */
export function createAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

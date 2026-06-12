import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con service-role (omite RLS). SOLO para Server Actions del servidor
 * (ej. crear cuentas de meseras). NUNCA importar desde código de cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

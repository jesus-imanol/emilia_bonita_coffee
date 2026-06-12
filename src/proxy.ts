import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Solo corre en /panel/*. El sitio público ("/", "/carta", assets) nunca
  // pasa por aquí, así que el marketing queda intacto.
  matcher: ["/panel/:path*"],
};

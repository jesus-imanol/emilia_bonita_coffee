import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMessagesAdmin } from "@/models/special";

/** Redirige según el rol (el middleware ya garantizó que hay sesión). */
export default async function PanelIndex() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/panel/login");

  // Tu cuenta (mensajes) entra directo a su pantalla, sin pasar por el panel.
  if (isMessagesAdmin(user.email ?? null)) redirect("/panel/mensajes");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(profile?.role === "admin" ? "/panel/admin" : "/panel/mesera");
}

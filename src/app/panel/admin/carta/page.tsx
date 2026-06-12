import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { MenuCategoryRow, MenuItemRow } from "@/models/menu.repo";
import { MenuAdmin } from "@/views/panel/MenuAdmin";

export default async function CartaAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/panel/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/panel/mesera");

  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <MenuAdmin
      categories={(categories ?? []) as MenuCategoryRow[]}
      items={(items ?? []) as MenuItemRow[]}
    />
  );
}

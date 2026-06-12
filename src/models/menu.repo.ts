import { unstable_cache } from "next/cache";
import { createAnonClient } from "@/lib/supabase/anon";
import { MENU } from "./menu.data";
import type {
  CategoryId,
  ExtraAddOn,
  MenuCategory,
  MenuItem,
  OptionGroup,
  PriceVariant,
} from "./menu.types";

/** Tag de caché de la carta (las acciones del admin llaman revalidateTag). */
export const MENU_TAG = "menu";

export interface MenuCategoryRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  option_groups: OptionGroup[] | null;
  sort_order: number;
  active: boolean;
}

export interface MenuItemRow {
  id: string;
  slug: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  variants: PriceVariant[] | null;
  options: string[] | null;
  picks: number | null;
  extra: ExtraAddOn | null;
  note: string | null;
  sort_order: number;
  active: boolean;
}

/** Filas de Supabase -> el mismo shape MenuCategory[] que usa todo el código. */
export function assembleMenu(
  cats: MenuCategoryRow[],
  items: MenuItemRow[]
): MenuCategory[] {
  return cats.map((c) => ({
    id: c.slug as CategoryId,
    name: c.name,
    tagline: c.tagline ?? undefined,
    optionGroups: c.option_groups ?? undefined,
    items: items
      .filter((i) => i.category_id === c.id)
      .map(
        (i): MenuItem => ({
          id: i.slug,
          name: i.name,
          description: i.description ?? undefined,
          price: i.price ?? undefined,
          variants: i.variants ?? undefined,
          options: i.options ?? undefined,
          picks: i.picks ?? undefined,
          extra: i.extra ?? undefined,
          note: i.note ?? undefined,
        })
      ),
  }));
}

async function fetchMenu(): Promise<MenuCategory[]> {
  try {
    const supabase = createAnonClient();
    const [{ data: cats }, { data: items }] = await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("active", true)
        .order("sort_order"),
      supabase
        .from("menu_items")
        .select("*")
        .eq("active", true)
        .order("sort_order"),
    ]);
    // Sin sembrar todavía -> usamos la carta del código como respaldo.
    if (!cats || cats.length === 0) return MENU;
    return assembleMenu(cats as MenuCategoryRow[], (items ?? []) as MenuItemRow[]);
  } catch {
    // Supabase caído o sin env -> el sitio público nunca se rompe.
    return MENU;
  }
}

/**
 * Carta para el sitio público + PDF + POS. Cacheada con tag "menu";
 * las ediciones del admin la revalidan al instante.
 */
export const getMenu = unstable_cache(fetchMenu, ["menu-v1"], {
  tags: [MENU_TAG],
  revalidate: 3600,
});

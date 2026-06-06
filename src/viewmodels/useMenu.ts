"use client";

import { useCallback, useMemo, useState } from "react";
import { MENU } from "@/models/menu.data";
import type { CategoryId, MenuCategory } from "@/models/menu.types";

export interface CategoryNavItem {
  id: CategoryId;
  name: string;
}

export interface UseMenu {
  categories: MenuCategory[];
  categoryNav: CategoryNavItem[];
  activeCategory: CategoryId;
  /** Selección manual (clic en tab). */
  selectCategory: (id: CategoryId) => void;
  /** Sincroniza la selección desde el scrollspy. */
  syncActiveFromScroll: (id: CategoryId) => void;
  totalItems: number;
}

/**
 * VIEWMODEL · Estado y acciones del menú: agrupa categorías,
 * expone la navegación y la categoría seleccionada.
 */
export function useMenu(initial?: CategoryId): UseMenu {
  const categories = MENU;
  const [activeCategory, setActiveCategory] = useState<CategoryId>(
    initial ?? categories[0].id
  );

  const categoryNav = useMemo<CategoryNavItem[]>(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories]
  );

  const totalItems = useMemo(
    () => categories.reduce((sum, c) => sum + c.items.length, 0),
    [categories]
  );

  const selectCategory = useCallback((id: CategoryId) => {
    setActiveCategory(id);
  }, []);

  const syncActiveFromScroll = useCallback((id: CategoryId) => {
    setActiveCategory((prev) => (prev === id ? prev : id));
  }, []);

  return {
    categories,
    categoryNav,
    activeCategory,
    selectCategory,
    syncActiveFromScroll,
    totalItems,
  };
}

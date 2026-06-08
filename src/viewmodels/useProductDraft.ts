"use client";

import { useMemo, useState } from "react";
import type { MenuCategory, MenuItem } from "@/models/menu.types";
import {
  emptyDraft,
  isSelectionComplete,
  resolveSelectionSpec,
  resolveUnitPrice,
  type SelectionDraft,
} from "@/models/menu.selection";

/**
 * VIEWMODEL · Borrador de elección del ProductSheet (sabor, tamaño,
 * ingredientes, extra, cantidad, comentario) + precio y validez en vivo.
 */
export function useProductDraft(item: MenuItem, category: MenuCategory) {
  const spec = useMemo(
    () => resolveSelectionSpec(item, category),
    [item, category]
  );
  const [draft, setDraft] = useState<SelectionDraft>(emptyDraft);

  const setFlavor = (flavor: string) =>
    setDraft((d) => ({ ...d, flavor }));

  const setSize = (variantLabel: string) =>
    setDraft((d) => ({ ...d, variantLabel }));

  const toggleIngredient = (ing: string) =>
    setDraft((d) => {
      if (d.ingredients.includes(ing)) {
        return { ...d, ingredients: d.ingredients.filter((x) => x !== ing) };
      }
      // Si ya llegó al tope, reemplaza el más antiguo (selección continua).
      if (d.ingredients.length >= spec.ingredientCount) {
        return { ...d, ingredients: [...d.ingredients.slice(1), ing] };
      }
      return { ...d, ingredients: [...d.ingredients, ing] };
    });

  const toggleExtra = () => setDraft((d) => ({ ...d, extra: !d.extra }));
  const setQty = (qty: number) =>
    setDraft((d) => ({ ...d, qty: Math.max(1, qty) }));
  const setNote = (note: string) => setDraft((d) => ({ ...d, note }));
  const reset = () => setDraft(emptyDraft());

  return {
    spec,
    draft,
    unitPrice: resolveUnitPrice(spec, draft),
    complete: isSelectionComplete(spec, draft),
    setFlavor,
    setSize,
    toggleIngredient,
    toggleExtra,
    setQty,
    setNote,
    reset,
  };
}

/* ============================================================
   MODEL · Especificación de elecciones por producto (puro)
   Decide qué debe elegir el cliente para agregar un ítem.
   ============================================================ */

import type {
  ExtraAddOn,
  MenuCategory,
  MenuItem,
  OptionGroup,
  PriceVariant,
} from "./menu.types";

export interface SelectionSpec {
  needsFlavor: boolean;
  flavorOptions: string[];
  needsSize: boolean;
  sizeOptions: PriceVariant[];
  needsIngredients: boolean;
  ingredientCount: number;
  ingredientGroups: OptionGroup[];
  /** Sustantivo para el encabezado: "ingredientes" (crepa) o "sabores". */
  pickNoun: string;
  addOn?: ExtraAddOn;
  /** Precio base (sin tamaño ni extra). */
  basePrice: number;
  /** ¿El ítem requiere abrir el selector? */
  hasChoices: boolean;
}

export interface SelectionDraft {
  flavor?: string;
  variantLabel?: string;
  ingredients: string[];
  extra: boolean;
  qty: number;
  note: string;
}

export function emptyDraft(): SelectionDraft {
  return { ingredients: [], extra: false, qty: 1, note: "" };
}

export function resolveSelectionSpec(
  item: MenuItem,
  category: MenuCategory
): SelectionSpec {
  // Mecánica "arma el tuyo": elige N de los grupos de la categoría (crepas).
  const usesCategoryGroups =
    Boolean(category.optionGroups?.length) && Boolean(item.picks);
  // Producto que pide elegir N de su propia lista de opciones (ej. 2 sabores).
  const usesItemPicks =
    !usesCategoryGroups &&
    (item.picks ?? 0) >= 2 &&
    Boolean(item.options?.length);

  const needsIngredients = usesCategoryGroups || usesItemPicks;
  const needsSize = Boolean(item.variants?.length);
  const needsFlavor = !needsIngredients && Boolean(item.options?.length);
  const addOn = item.extra;
  const hasChoices = needsFlavor || needsSize || needsIngredients || Boolean(addOn);

  const ingredientGroups = usesCategoryGroups
    ? category.optionGroups ?? []
    : usesItemPicks
      ? [{ label: "", options: item.options! }]
      : [];

  return {
    needsFlavor,
    flavorOptions: needsFlavor ? item.options! : [],
    needsSize,
    sizeOptions: needsSize ? item.variants! : [],
    needsIngredients,
    ingredientCount: item.picks ?? 0,
    ingredientGroups,
    pickNoun: usesItemPicks ? "sabores" : "ingredientes",
    addOn,
    basePrice: item.price ?? 0,
    hasChoices,
  };
}

/** Precio unitario según el borrador (tamaño elegido + extra opcional). */
export function resolveUnitPrice(
  spec: SelectionSpec,
  draft: SelectionDraft
): number {
  let price = spec.basePrice;
  if (spec.needsSize) {
    if (draft.variantLabel) {
      const v = spec.sizeOptions.find((s) => s.label === draft.variantLabel);
      price = v?.price ?? spec.basePrice;
    } else {
      // Antes de elegir tamaño mostramos el menor como referencia.
      price = Math.min(...spec.sizeOptions.map((s) => s.price));
    }
  }
  if (spec.addOn && draft.extra) price += spec.addOn.price;
  return price;
}

/** ¿El borrador tiene todas las elecciones requeridas? */
export function isSelectionComplete(
  spec: SelectionSpec,
  draft: SelectionDraft
): boolean {
  if (spec.needsFlavor && !draft.flavor) return false;
  if (spec.needsSize && !draft.variantLabel) return false;
  if (spec.needsIngredients && draft.ingredients.length !== spec.ingredientCount)
    return false;
  return draft.qty >= 1;
}

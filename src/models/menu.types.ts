/* ============================================================
   MODEL · Tipos del menú (puros, sin React)
   ============================================================ */

export type CategoryId =
  | "hamburguesas"
  | "hot-dogs"
  | "crepas"
  | "snacks"
  | "postres"
  | "bebidas-calientes"
  | "frappes"
  | "bebidas-frias";

/** Precio por tamaño/opción cuando un producto tiene más de uno. */
export interface PriceVariant {
  label: string; // ej. "½ Lt", "1 Lt"
  price: number; // MXN
}

/** Complemento opcional con cargo (ej. leche deslactosada +$5). */
export interface ExtraAddOn {
  label: string; // ej. "Leche deslactosada"
  price: number; // MXN que se suman si el cliente lo elige
}

export interface MenuItem {
  id: string;
  name: string;
  /** Ingredientes o detalle del producto. */
  description?: string;
  /** Precio único en MXN (usar esto o `variants`, no ambos). */
  price?: number;
  /** Precios por tamaño cuando aplica (ej. medio litro / litro). */
  variants?: PriceVariant[];
  /** Nota corta junto al nombre, ej. "8 pzas", "c/ papas fritas". */
  note?: string;
  /** Sabores u opciones elegibles, se muestran como chips. */
  options?: string[];
  /** Para crepas: cuántos ingredientes elige el cliente (1 o 2). */
  picks?: number;
  /** Complemento opcional con cargo (ej. leche deslactosada +$5). */
  extra?: ExtraAddOn;
}

/** Grupo de opciones que aplica a toda una categoría (ej. crepas dulces/saladas). */
export interface OptionGroup {
  label: string;
  options: string[];
}

export interface MenuCategory {
  id: CategoryId;
  name: string;
  /** Micro-descripción cálida y honesta de la categoría. */
  tagline?: string;
  items: MenuItem[];
  optionGroups?: OptionGroup[];
}

/** Formato de precio en pesos mexicanos. */
export function formatMXN(value: number): string {
  return `$${value}`;
}

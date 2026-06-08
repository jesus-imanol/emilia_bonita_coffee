/* ============================================================
   MODEL · Carrito (tipos + cálculos puros, sin React)
   ============================================================ */

import type { CategoryId } from "./menu.types";

export interface CartLine {
  /** Identidad de la configuración: mismo lineId = misma línea (suma qty). */
  lineId: string;
  itemId: string;
  categoryId: CategoryId;
  name: string;
  unitPrice: number;
  qty: number;
  variantLabel?: string;
  flavor?: string;
  ingredients?: string[];
  /** Extra opcional elegido (ej. leche deslactosada). */
  extra?: boolean;
  extraLabel?: string;
  note?: string;
}

export interface OrderDetails {
  name?: string;
  comment?: string;
}

/** Clave determinista de configuración: ingredientes ordenados para fusionar. */
export function computeLineId(parts: {
  itemId: string;
  variantLabel?: string;
  flavor?: string;
  ingredients?: string[];
  extra?: boolean;
  note?: string;
}): string {
  return [
    parts.itemId,
    parts.variantLabel ?? "",
    parts.flavor ?? "",
    (parts.ingredients ?? []).slice().sort().join("|"),
    parts.extra ? "+extra" : "",
    (parts.note ?? "").trim(),
  ].join("::");
}

export function lineTotal(line: CartLine): number {
  return line.unitPrice * line.qty;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

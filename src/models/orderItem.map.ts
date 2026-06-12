/* ============================================================
   MODEL · Mapeo entre CartLine (UI) y order_items (Supabase)
   ============================================================ */

import { computeLineId, type CartLine } from "./cart.types";
import type { CategoryId } from "./menu.types";

export interface OrderItemRow {
  id: string;
  order_id: string;
  item_id: string;
  category_id: string;
  name: string;
  unit_price: number;
  qty: number;
  variant_label: string | null;
  flavor: string | null;
  ingredients: string[] | null;
  extra: boolean | null;
  extra_label: string | null;
  note: string | null;
  line_total: number;
}

/** Fila lista para insertar en order_items (line_total recalculado). */
export function cartLineToInsert(line: CartLine, orderId: string) {
  const unitPrice = Math.round(line.unitPrice);
  return {
    order_id: orderId,
    item_id: line.itemId,
    category_id: line.categoryId,
    name: line.name,
    unit_price: unitPrice,
    qty: line.qty,
    variant_label: line.variantLabel ?? null,
    flavor: line.flavor ?? null,
    ingredients: line.ingredients ?? null,
    extra: line.extra ?? null,
    extra_label: line.extraLabel ?? null,
    note: line.note ?? null,
    line_total: unitPrice * line.qty,
  };
}

/** Reconstruye una CartLine (con lineId determinista) desde una fila. */
export function rowToCartLine(row: OrderItemRow): CartLine {
  return {
    lineId: computeLineId({
      itemId: row.item_id,
      variantLabel: row.variant_label ?? undefined,
      flavor: row.flavor ?? undefined,
      ingredients: row.ingredients ?? undefined,
      extra: row.extra ?? undefined,
      note: row.note ?? undefined,
    }),
    itemId: row.item_id,
    categoryId: row.category_id as CategoryId,
    name: row.name,
    unitPrice: row.unit_price,
    qty: row.qty,
    variantLabel: row.variant_label ?? undefined,
    flavor: row.flavor ?? undefined,
    ingredients: row.ingredients ?? undefined,
    extra: row.extra ?? undefined,
    extraLabel: row.extra_label ?? undefined,
    note: row.note ?? undefined,
  };
}

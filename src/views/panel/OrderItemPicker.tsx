"use client";

import { useState } from "react";
import { Plus, SlidersHorizontal } from "@phosphor-icons/react";
import { formatMXN, type MenuCategory, type MenuItem } from "@/models/menu.types";
import { resolveSelectionSpec } from "@/models/menu.selection";
import { useOrderDraft } from "@/viewmodels/useOrderDraft";
import { ProductSheet } from "@/views/components/ProductSheet";

export function OrderItemPicker({
  item,
  category,
}: {
  item: MenuItem;
  category: MenuCategory;
}) {
  const spec = resolveSelectionSpec(item, category);
  const addLine = useOrderDraft((s) => s.addLine);
  const [open, setOpen] = useState(false);

  const priceLabel = item.variants?.length
    ? `desde ${formatMXN(Math.min(...item.variants.map((v) => v.price)))}`
    : formatMXN(item.price ?? 0);

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-ink">{item.name}</p>
        <p className="text-xs text-ink-soft">{priceLabel}</p>
      </div>

      {spec.hasChoices ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-pill border border-green/40 px-3.5 py-2 text-sm font-semibold text-green transition-colors hover:bg-green/8"
          >
            <SlidersHorizontal size={15} weight="bold" />
            Elegir
          </button>
          <ProductSheet
            item={item}
            category={category}
            open={open}
            onClose={() => setOpen(false)}
            onAdd={addLine}
            addLabel="Agregar al pedido"
          />
        </>
      ) : (
        <button
          type="button"
          onClick={() =>
            addLine({
              itemId: item.id,
              categoryId: category.id,
              name: item.name,
              unitPrice: item.price ?? 0,
              qty: 1,
            })
          }
          className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-green px-3.5 py-2 text-sm font-semibold text-on-dark transition-colors hover:bg-bean"
        >
          <Plus size={15} weight="bold" />
          Agregar
        </button>
      )}
    </div>
  );
}

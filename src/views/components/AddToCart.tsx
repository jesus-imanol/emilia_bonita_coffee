"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { formatMXN, type MenuCategory, type MenuItem } from "@/models/menu.types";
import { computeLineId } from "@/models/cart.types";
import { resolveSelectionSpec } from "@/models/menu.selection";
import { useCart } from "@/viewmodels/useCart";
import { QtyStepper } from "./QtyStepper";
import { ProductSheet } from "./ProductSheet";

export function AddToCart({
  item,
  category,
}: {
  item: MenuItem;
  category: MenuCategory;
}) {
  const spec = resolveSelectionSpec(item, category);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Todos los hooks arriba (no condicionales).
  const addLine = useCart((s) => s.addLine);
  const updateQty = useCart((s) => s.updateQty);
  const quickLineId = computeLineId({ itemId: item.id });
  const quickLine = useCart((s) =>
    s.lines.find((l) => l.lineId === quickLineId)
  );

  if (spec.hasChoices) {
    return (
      <>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="pressable mt-auto inline-flex w-full items-center justify-center gap-2 rounded-pill bg-green px-4 py-2.5 pt-2.5 text-sm font-semibold text-on-dark transition-colors hover:bg-bean"
        >
          <Plus size={16} weight="bold" />
          Elegir y agregar
        </button>
        <ProductSheet
          item={item}
          category={category}
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
        />
      </>
    );
  }

  if (quickLine) {
    return (
      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <QtyStepper
          value={quickLine.qty}
          onChange={(q) => updateQty(quickLineId, q)}
          min={0}
          ariaLabel={`Cantidad de ${item.name}`}
        />
        <span className="font-display text-sm font-semibold text-green">
          {formatMXN((item.price ?? 0) * quickLine.qty)}
        </span>
      </div>
    );
  }

  return (
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
      className="pressable mt-auto inline-flex w-full items-center justify-center gap-2 rounded-pill bg-green px-4 py-2.5 text-sm font-semibold text-on-dark transition-colors hover:bg-bean"
    >
      <Plus size={16} weight="bold" />
      Agregar
    </button>
  );
}

"use client";

import { create } from "zustand";
import {
  cartCount,
  cartSubtotal,
  computeLineId,
  type CartLine,
} from "@/models/cart.types";

interface OrderDraftState {
  customerName: string;
  note: string;
  lines: CartLine[];
  setCustomerName: (v: string) => void;
  setNote: (v: string) => void;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  updateQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  /** Carga un pedido existente para corregirlo. */
  init: (data: { customerName?: string; note?: string; lines: CartLine[] }) => void;
  reset: () => void;
}

/**
 * VIEWMODEL · Draft del pedido en el POS (zustand, NO persistido).
 * Reutiliza la misma lógica de fusión de líneas que el carrito público.
 */
export const useOrderDraft = create<OrderDraftState>((set) => ({
  customerName: "",
  note: "",
  lines: [],

  setCustomerName: (v) => set({ customerName: v }),
  setNote: (v) => set({ note: v }),

  addLine: (incoming) => {
    const lineId = computeLineId({
      itemId: incoming.itemId,
      variantLabel: incoming.variantLabel,
      flavor: incoming.flavor,
      ingredients: incoming.ingredients,
      extra: incoming.extra,
      note: incoming.note,
    });
    set((state) => {
      const exists = state.lines.some((l) => l.lineId === lineId);
      if (exists) {
        return {
          lines: state.lines.map((l) =>
            l.lineId === lineId ? { ...l, qty: l.qty + incoming.qty } : l
          ),
        };
      }
      return { lines: [...state.lines, { ...incoming, lineId }] };
    });
  },

  updateQty: (lineId, qty) =>
    set((state) => ({
      lines:
        qty <= 0
          ? state.lines.filter((l) => l.lineId !== lineId)
          : state.lines.map((l) => (l.lineId === lineId ? { ...l, qty } : l)),
    })),

  removeLine: (lineId) =>
    set((state) => ({
      lines: state.lines.filter((l) => l.lineId !== lineId),
    })),

  init: (data) =>
    set({
      customerName: data.customerName ?? "",
      note: data.note ?? "",
      lines: data.lines,
    }),

  reset: () => set({ customerName: "", note: "", lines: [] }),
}));

export const useOrderDraftSubtotal = () =>
  useOrderDraft((s) => cartSubtotal(s.lines));
export const useOrderDraftCount = () => useOrderDraft((s) => cartCount(s.lines));

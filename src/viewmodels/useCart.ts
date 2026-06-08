"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  cartCount,
  cartSubtotal,
  computeLineId,
  type CartLine,
} from "@/models/cart.types";

interface CartState {
  lines: CartLine[];
  isDrawerOpen: boolean;
  _hasHydrated: boolean;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  removeLine: (lineId: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  setHasHydrated: (v: boolean) => void;
}

/**
 * VIEWMODEL · Store del carrito (zustand + persist en localStorage).
 * Sin provider: cualquier componente client lo importa directamente.
 */
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isDrawerOpen: false,
      _hasHydrated: false,

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

      removeLine: (lineId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.lineId !== lineId),
        })),

      updateQty: (lineId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.lineId !== lineId)
              : state.lines.map((l) =>
                  l.lineId === lineId ? { ...l, qty } : l
                ),
        })),

      clearCart: () => set({ lines: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "emilia-bonita-cart",
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos las líneas (no el estado del drawer ni la bandera).
      partialize: (state) => ({ lines: state.lines }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);

/** Selectores derivados. */
export const useCartCount = () => useCart((s) => cartCount(s.lines));
export const useCartSubtotal = () => useCart((s) => cartSubtotal(s.lines));
export const useCartHydrated = () => useCart((s) => s._hasHydrated);

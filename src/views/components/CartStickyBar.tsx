"use client";

import { ShoppingBagOpen } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { formatMXN } from "@/models/menu.types";
import {
  useCart,
  useCartCount,
  useCartHydrated,
  useCartSubtotal,
} from "@/viewmodels/useCart";

/** Barra inferior solo móvil: "Ver pedido (N) - $total". */
export function CartStickyBar() {
  const reduce = useReducedMotion();
  const hydrated = useCartHydrated();
  const count = useCartCount();
  const subtotal = useCartSubtotal();
  const isDrawerOpen = useCart((s) => s.isDrawerOpen);
  const openDrawer = useCart((s) => s.openDrawer);

  const show = hydrated && count > 0 && !isDrawerOpen;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 90, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 lg:hidden"
          style={{ zIndex: "var(--z-sticky)" }}
        >
          <button
            type="button"
            onClick={openDrawer}
            className="pressable flex w-full items-center justify-between gap-3 rounded-pill bg-green px-5 py-3.5 text-on-dark shadow-[var(--shadow-lift)]"
          >
            <span className="inline-flex items-center gap-2 font-semibold">
              <ShoppingBagOpen size={20} weight="bold" />
              Ver pedido ({count})
            </span>
            <span className="font-display font-semibold tabular-nums">
              {formatMXN(subtotal)}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

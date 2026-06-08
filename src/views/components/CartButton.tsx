"use client";

import { ShoppingBagOpen } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCart,
  useCartCount,
  useCartHydrated,
} from "@/viewmodels/useCart";

/** Botón de carrito para el navbar. `tone` define el color del badge. */
export function CartButton({ tone }: { tone: "light" | "dark" }) {
  const reduce = useReducedMotion();
  const hydrated = useCartHydrated();
  const count = useCartCount();
  const openDrawer = useCart((s) => s.openDrawer);
  const show = hydrated && count > 0;

  const badge =
    tone === "light"
      ? "bg-cream text-green-deep"
      : "bg-green text-on-green";

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label={show ? `Ver pedido, ${count} en el carrito` : "Ver pedido"}
      className="pressable relative inline-flex h-10 w-10 items-center justify-center rounded-pill"
    >
      <ShoppingBagOpen size={22} weight="bold" />
      <AnimatePresence>
        {show && (
          <motion.span
            key="badge"
            initial={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 28 }}
            className={`absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-pill px-1 text-xs font-bold tabular-nums ${badge}`}
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

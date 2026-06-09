"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCart, useCartCount, useCartHydrated } from "@/viewmodels/useCart";

/** Botón flotante para volver al inicio. Aparece al pasar el hero. */
export function ScrollToTop() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const hydrated = useCartHydrated();
  const count = useCartCount();
  const isDrawerOpen = useCart((s) => s.isDrawerOpen);

  // Barra de pedido móvil visible -> subimos el botón para no encimarlos.
  const cartBarVisible = hydrated && count > 0;

  // IntersectionObserver sobre el hero (sin scroll listeners).
  useEffect(() => {
    const hero = document.getElementById("inicio");
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShow(entry.intersectionRatio < 0.1),
      { threshold: [0, 0.1] }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  return (
    <AnimatePresence>
      {show && !isDrawerOpen && (
        <motion.button
          type="button"
          onClick={scrollTop}
          aria-label="Volver arriba"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className={`pressable fixed right-5 inline-flex h-12 w-12 items-center justify-center rounded-pill bg-green-deep text-on-green shadow-[var(--shadow-lift)] ring-1 ring-on-green/20 transition-colors hover:bg-green ${
            cartBarVisible ? "bottom-24 lg:bottom-6" : "bottom-6"
          }`}
          style={{ zIndex: "var(--z-sticky)" }}
        >
          <ArrowUp size={22} weight="bold" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

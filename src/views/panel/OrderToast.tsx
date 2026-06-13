"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle } from "@phosphor-icons/react";
import { useOrderToast } from "@/viewmodels/useOrderToast";

/** VIEW · Aviso breve sobre la barra de acción (feedback de "agregado"). */
export function OrderToast() {
  const message = useOrderToast((s) => s.message);
  const seq = useOrderToast((s) => s.seq);
  const clear = useOrderToast((s) => s.clear);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => clear(), 1500);
    return () => clearTimeout(t);
  }, [seq, message, clear]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={seq}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pointer-events-none fixed inset-x-0 bottom-[5.5rem] z-30 mx-auto flex w-fit max-w-[90%] items-center gap-2 rounded-pill bg-bean px-4 py-2.5 text-sm font-semibold text-on-dark shadow-[var(--shadow-lift)]"
        >
          <CheckCircle size={18} weight="fill" className="shrink-0 text-green-soft" />
          <span className="truncate">Agregado · {message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

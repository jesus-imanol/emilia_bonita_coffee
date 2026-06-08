"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useScrollLock } from "@/viewmodels/useScrollLock";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';
const DRAWER_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  label: string;
  /** "right" = drawer lateral · "bottom" = hoja inferior. */
  align: "right" | "bottom";
  /** Variable CSS de z-index, ej. "var(--z-cart)". */
  zIndex: string;
  children: ReactNode;
}

/**
 * VIEW · Cáscara de modal reutilizable. Portal a <body> (escapa de los
 * transforms/filters de Motion en la carta), backdrop, focus-trap, Esc,
 * scroll-lock y reduced-motion.
 */
export function ModalShell({
  open,
  onClose,
  label,
  align,
  zIndex,
  children,
}: ModalShellProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  // true solo en cliente (sin setState-en-effect, sin mismatch de hidratación).
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const focusables = () =>
      panelRef.current
        ? Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        : [];
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  const panelMotion =
    align === "right"
      ? {
          initial: reduce ? { opacity: 0 } : { x: "100%" },
          animate: reduce ? { opacity: 1 } : { x: 0 },
          exit: reduce ? { opacity: 0 } : { x: "100%" },
        }
      : {
          initial: reduce ? { opacity: 0 } : { y: "100%" },
          animate: reduce ? { opacity: 1 } : { y: 0 },
          exit: reduce ? { opacity: 0 } : { y: "100%" },
        };

  const panelPos =
    align === "right"
      ? "right-0 top-0 h-full w-full max-w-md rounded-l-[22px]"
      : "inset-x-0 bottom-0 mx-auto w-full max-w-lg max-h-[88dvh] rounded-t-[22px]";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex }}>
          <motion.div
            className="absolute inset-0 bg-espresso/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className={`absolute flex flex-col overflow-hidden bg-cream shadow-[var(--shadow-lift)] ${panelPos}`}
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={panelMotion.exit}
            transition={{ duration: reduce ? 0.2 : 0.36, ease: DRAWER_EASE }}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

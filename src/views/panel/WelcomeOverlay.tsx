"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Heart } from "@phosphor-icons/react";
import { getWelcomeStore } from "@/viewmodels/welcomeStore";

const HEART_COLORS = ["#e0607e", "#d6456b", "#f08aa3", "#b45b3c", "#e8849b"];

// Posiciones de los corazones (una sola vez, fuera del render).
const HEARTS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: 14 + Math.random() * 26,
  delay: Math.random() * 3.5,
  duration: 4.5 + Math.random() * 4,
  color: HEART_COLORS[i % HEART_COLORS.length],
}));

/**
 * VIEW · Bienvenida diaria para una mesera: sale sola una vez al día con el
 * mensaje del día y se puede reabrir con el botón de corazón.
 * Snoopy + corazones + mensaje. Respeta reduced-motion.
 */
export function WelcomeOverlay({
  userId,
  dateKey,
  message,
}: {
  userId: string;
  dateKey: string;
  message: string;
}) {
  const reduce = useReducedMotion();
  const store = getWelcomeStore(userId, dateKey);
  const state = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  const show = state === "show";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden px-6 text-center"
          style={{ zIndex: 100, background: "rgba(247, 239, 226, 0.97)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="dialog"
          aria-label="Mensaje de bienvenida"
        >
          {/* Corazones flotando */}
          {!reduce && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {HEARTS.map((h) => (
                <motion.div
                  key={h.id}
                  className="absolute bottom-[-40px]"
                  style={{ left: `${h.left}%` }}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{
                    y: "-112vh",
                    opacity: [0, 1, 1, 0],
                    x: [0, 12, -12, 0],
                  }}
                  transition={{
                    duration: h.duration,
                    delay: h.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Heart size={h.size} weight="fill" color={h.color} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Snoopy */}
          <motion.div
            className="relative overflow-hidden rounded-[28px] border border-[var(--line)] bg-white p-2 shadow-[var(--shadow-lift)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 24 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/imagen_decorativa_mesera/snoopy_monio.png"
              alt=""
              width={375}
              height={666}
              priority
              className="h-40 w-auto"
            />
          </motion.div>

          <motion.p
            className="hand mt-7 text-2xl text-terracotta"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: reduce ? 0.1 : 0.35 }}
          >
            Para ti, mi amor 💖
          </motion.p>

          <motion.p
            className="mx-auto mt-3 max-w-md text-balance text-xl font-semibold leading-snug text-ink sm:text-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduce ? 0.1 : 0.55 }}
          >
            {message}
          </motion.p>

          <motion.button
            type="button"
            onClick={store.dismiss}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reduce ? 0.1 : 1.3 }}
            whileTap={{ scale: 0.96 }}
            className="mt-8 inline-flex items-center gap-2 rounded-pill bg-terracotta px-7 py-3 text-base font-semibold text-white shadow-[var(--shadow-lift)] transition-opacity hover:opacity-90"
          >
            <Heart size={18} weight="fill" />
            Empezar mi día
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

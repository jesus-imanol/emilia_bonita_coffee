"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useReveal, type RevealConfig } from "@/viewmodels/useReveal";

interface RevealProps extends RevealConfig {
  children: ReactNode;
  className?: string;
}

/**
 * VIEW · Envoltorio reutilizable de reveal on-scroll.
 * Toda la lógica (incluido reduced-motion) vive en useReveal.
 */
export function Reveal({ children, className, ...config }: RevealProps) {
  const r = useReveal(config);
  return (
    <motion.div
      className={className}
      initial={r.initial}
      whileInView={r.whileInView}
      viewport={r.viewport}
      transition={r.transition}
    >
      {children}
    </motion.div>
  );
}

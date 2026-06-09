"use client";

import { useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export interface RevealConfig {
  /** Desplazamiento vertical inicial (px). */
  y?: number;
  /** Duración (segundos). */
  duration?: number;
  /** Retardo (segundos). */
  delay?: number;
}

/**
 * VIEWMODEL · Estado de un reveal on-scroll. Devuelve props listos
 * para <motion.*>. Solo opacidad + desplazamiento (GPU, baratos): nada
 * de filter blur, que es caro de animar al hacer scroll. Respeta
 * prefers-reduced-motion (cae a un fade suave).
 */
export function useReveal(config: RevealConfig = {}) {
  const reduce = useReducedMotion();
  const { y = 22, duration = 0.6, delay = 0 } = config;

  return {
    reduce,
    initial: reduce ? { opacity: 0 } : { opacity: 0, y },
    whileInView: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3, margin: "0px 0px -10% 0px" } as const,
    transition: {
      duration: reduce ? 0.25 : duration,
      delay: reduce ? 0 : delay,
      ease: EASE_OUT,
    },
  };
}

/**
 * VIEWMODEL · Variants para listas con stagger (contenedor + item).
 * El reveal escalonado de las cards del menú se apoya aquí.
 */
export function useStaggerReveal(stagger = 0.05) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: 0.02,
      },
    },
  };

  const item: Variants = reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.25 } },
      }
    : {
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: EASE_OUT },
        },
      };

  return { reduce, container, item };
}

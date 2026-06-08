"use client";

import { useEffect } from "react";

/**
 * VIEWMODEL · Bloquea el scroll de la página mientras un modal está abierto.
 * Bloquea el <html> (el scroll vive ahí por `body { overflow-x: clip }`),
 * NO el body. `scrollbar-gutter: stable` (en globals) evita el salto.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [locked]);
}

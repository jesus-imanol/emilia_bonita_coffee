"use client";

import { useEffect, useState } from "react";

/**
 * VIEWMODEL · Sección activa para el nav y las categorías del menú.
 * Usa IntersectionObserver (nunca window scroll listeners).
 */
export function useScrollSpy(
  ids: string[],
  options?: { rootMargin?: string }
): string | null {
  const idsKey = ids.join(",");
  const rootMargin = options?.rootMargin ?? "-50% 0px -45% 0px";
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    const sectionIds = idsKey ? idsKey.split(",") : [];
    if (sectionIds.length === 0) return;

    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // El primero en orden de documento que esté dentro de la banda gana.
        const firstVisible = sectionIds.find((id) => visible.has(id));
        if (firstVisible) setActiveId(firstVisible);
      },
      { rootMargin, threshold: 0 }
    );

    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [idsKey, rootMargin]);

  return activeId;
}

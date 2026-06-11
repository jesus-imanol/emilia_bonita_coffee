"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CategoryId } from "@/models/menu.types";
import type { CategoryNavItem } from "@/viewmodels/useMenu";

interface CategoryTabsProps {
  items: CategoryNavItem[];
  active: CategoryId;
  onSelect: (id: CategoryId) => void;
}

/** Ancla de la sección de una categoría (evita chocar con los ids del nav). */
export const categoryAnchorId = (id: CategoryId) => `cat-${id}`;

export function CategoryTabs({ items, active, onSelect }: CategoryTabsProps) {
  const reduce = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Centra la pastilla activa moviendo SOLO el scroller horizontal de tabs.
  // (No usamos scrollIntoView porque arrastraría también el scroll de la página.)
  useEffect(() => {
    const scroller = scrollerRef.current;
    const el = pillRefs.current[active];
    if (!scroller || !el) return;
    const target = el.offsetLeft - scroller.clientWidth / 2 + el.clientWidth / 2;
    scroller.scrollTo({
      left: Math.max(0, target),
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active, reduce]);

  const handleClick = (id: CategoryId) => {
    onSelect(id);
    document.getElementById(categoryAnchorId(id))?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div className="sticky top-[64px] z-40 border-b border-[var(--line)] bg-cream/95 sm:top-[68px]">
      <div
        ref={scrollerRef}
        role="tablist"
        aria-label="Categorías del menú"
        className="no-scrollbar flex gap-1.5 overflow-x-auto px-1 py-3"
      >
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              ref={(el) => {
                pillRefs.current[it.id] = el;
              }}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleClick(it.id)}
              className={`pressable relative shrink-0 whitespace-nowrap rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
                isActive ? "text-on-dark" : "text-ink-soft hover:text-ink"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId={reduce ? undefined : "cat-pill"}
                  className="absolute inset-0 -z-10 rounded-pill bg-green"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              {it.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

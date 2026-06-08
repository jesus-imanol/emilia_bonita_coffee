"use client";

import { useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { useMenu } from "@/viewmodels/useMenu";
import { useScrollSpy } from "@/viewmodels/useScrollSpy";
import { useStaggerReveal } from "@/viewmodels/useReveal";
import { CategoryTabs, categoryAnchorId } from "@/views/components/CategoryTabs";
import { MenuCard } from "@/views/components/MenuCard";
import type { CategoryId, MenuCategory } from "@/models/menu.types";

export function MenuSection() {
  const {
    categories,
    categoryNav,
    activeCategory,
    selectCategory,
    syncActiveFromScroll,
  } = useMenu();

  const anchorIds = useMemo(
    () => categories.map((c) => categoryAnchorId(c.id)),
    [categories]
  );
  const activeAnchor = useScrollSpy(anchorIds, {
    rootMargin: "-140px 0px -55% 0px",
  });

  useEffect(() => {
    if (!activeAnchor) return;
    const id = activeAnchor.replace("cat-", "") as CategoryId;
    syncActiveFromScroll(id);
  }, [activeAnchor, syncActiveFromScroll]);

  return (
    <section id="menu" className="anchor bg-cream">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado de la carta */}
        <div className="pt-20 sm:pt-28">
          <p className="hand text-3xl text-green-soft">de nuestra libreta</p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 className="font-display text-4xl font-bold tracking-tight text-green-deep sm:text-5xl">
              La carta
            </h2>
            <p className="pb-1 text-sm font-medium text-ink-soft">
              Precios en pesos mexicanos (MXN)
            </p>
          </div>
        </div>

        {/* Navegación de categorías (sticky: su contenedor abarca toda la carta) */}
        <div className="mt-6">
          <CategoryTabs
            items={categoryNav}
            active={activeCategory}
            onSelect={selectCategory}
          />
        </div>

        {/* Categorías */}
        <div className="pb-20 sm:pb-28">
          {categories.map((cat) => (
            <CategoryBlock key={cat.id} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryBlock({ cat }: { cat: MenuCategory }) {
  const { container, item } = useStaggerReveal(0.05);

  return (
    <div id={categoryAnchorId(cat.id)} className="anchor-menu pt-14 first:pt-10">
      <header className="mb-6">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-green-deep sm:text-3xl">
          {cat.name}
        </h3>
        {cat.tagline && (
          <p className="mt-1.5 max-w-xl text-base text-ink-soft">{cat.tagline}</p>
        )}
      </header>

      {/* Grupos de opciones a nivel categoría (crepas dulces / saladas) */}
      {cat.optionGroups && (
        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          {cat.optionGroups.map((group) => (
            <div
              key={group.label}
              className="rounded-card border border-[var(--line)] bg-cream-deep/45 p-5"
            >
              <p className="font-display text-lg font-semibold text-green">
                {group.label}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {group.options.map((opt) => (
                  <li
                    key={opt}
                    className="rounded-pill bg-green/10 px-2.5 py-1 text-xs font-medium text-ink-soft"
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {cat.id === "crepas" && (
        <p className="mb-6 text-sm text-ink-soft">
          Arma tu crepa: elige 1 o 2 ingredientes de las opciones de arriba.
        </p>
      )}

      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12, margin: "0px 0px -8% 0px" }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {cat.items.map((menuItem) => (
          <motion.li key={menuItem.id} variants={item} className="h-full">
            <MenuCard item={menuItem} category={cat} />
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

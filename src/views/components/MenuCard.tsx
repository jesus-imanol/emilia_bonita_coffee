import { formatMXN, type MenuItem } from "@/models/menu.types";

/**
 * VIEW · Tarjeta presentacional de un producto del menú.
 * Componente puro: recibe el item y no contiene lógica de negocio.
 */
export function MenuCard({ item }: { item: MenuItem }) {
  const hasVariants = Boolean(item.variants?.length);

  return (
    <article className="lift flex h-full flex-col rounded-card border border-[var(--line)] bg-cream/55 p-5 hover:border-green/35 hover:bg-cream">
      <div className="flex items-baseline gap-2.5">
        <h4 className="font-display text-lg font-semibold leading-tight text-ink">
          {item.name}
          {item.note && (
            <span className="ml-2 align-middle text-xs font-medium text-ink-soft">
              {item.note}
            </span>
          )}
        </h4>

        {!hasVariants && item.price !== undefined && (
          <>
            <span
              aria-hidden="true"
              className="mb-1.5 flex-1 self-end border-b border-dotted border-[var(--line-strong)]"
            />
            <span className="shrink-0 font-display text-lg font-semibold text-green">
              {formatMXN(item.price)}
            </span>
          </>
        )}
      </div>

      {item.description && (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {item.description}
        </p>
      )}

      {item.options && item.options.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {item.options.map((opt) => (
            <li
              key={opt}
              className="rounded-pill bg-green/10 px-2.5 py-1 text-xs font-medium text-ink-soft"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}

      {hasVariants && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {item.variants!.map((v) => (
            <li
              key={v.label}
              className="inline-flex items-baseline gap-1.5 rounded-pill border border-[var(--line)] px-3 py-1"
            >
              <span className="text-xs font-medium text-ink-soft">{v.label}</span>
              <span className="font-display text-sm font-semibold text-green">
                {formatMXN(v.price)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {item.extra && (
        <p className="mt-auto pt-3 text-xs font-medium text-ink-soft">
          + {item.extra}
        </p>
      )}
    </article>
  );
}

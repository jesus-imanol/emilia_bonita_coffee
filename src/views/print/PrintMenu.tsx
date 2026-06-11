import Image from "next/image";
import { BUSINESS } from "@/models/business.data";
import { MENU } from "@/models/menu.data";
import { formatMXN, type MenuItem, type OptionGroup } from "@/models/menu.types";

function PrintItem({ item }: { item: MenuItem }) {
  const hasVariants = Boolean(item.variants?.length);
  return (
    <li>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[12.5px] font-semibold leading-tight text-ink">
          {item.name}
          {item.note && (
            <span className="ml-1 text-[10px] font-medium text-ink-soft">
              {item.note}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="mb-0.5 flex-1 self-end border-b border-dotted border-[var(--line-strong)]"
        />
        {!hasVariants && item.price !== undefined && (
          <span className="shrink-0 font-display text-[12.5px] font-semibold text-green">
            {formatMXN(item.price)}
          </span>
        )}
      </div>

      {item.description && (
        <p className="text-[10px] leading-snug text-ink-soft">
          {item.description}
        </p>
      )}

      {hasVariants && (
        <p className="text-[10.5px] font-medium text-green">
          {item.variants!
            .map((v) => `${v.label} ${formatMXN(v.price)}`)
            .join("    ")}
        </p>
      )}

      {item.options && item.options.length > 0 && (
        <p className="text-[10px] leading-snug text-ink-soft">
          {item.options.join(", ")}
        </p>
      )}

      {item.extra && (
        <p className="text-[10px] font-medium text-ink-soft">
          + {item.extra.label} {formatMXN(item.extra.price)}
        </p>
      )}
    </li>
  );
}

function CategoryOptions({ groups }: { groups: OptionGroup[] }) {
  return (
    <div className="mt-1.5 space-y-1 rounded-[8px] bg-cream-deep/60 px-2.5 py-2 text-[10px] leading-snug">
      {groups.map((g) => (
        <p key={g.label}>
          <span className="font-semibold text-green">{g.label}: </span>
          <span className="text-ink-soft">{g.options.join(", ")}</span>
        </p>
      ))}
    </div>
  );
}

export function PrintMenu() {
  return (
    <div className="carta-sheet flex w-[8.5in] min-h-[11in] flex-col rounded-[6px] bg-cream p-[0.5in] shadow-[var(--shadow-lift)]">
      {/* Encabezado */}
      <header className="flex items-center gap-4 rounded-[12px] bg-bean px-5 py-4 text-on-dark">
        <Image
          src="/logo-emilia-bonita.png"
          alt=""
          width={741}
          height={878}
          priority
          className="h-12 w-auto"
        />
        <div className="leading-none">
          <p className="font-display text-2xl font-bold tracking-tight">
            {BUSINESS.name}
          </p>
          <p className="hand mt-1.5 text-xl text-latte">nuestra carta</p>
        </div>
        <div className="ml-auto text-right text-[10px] leading-relaxed text-on-dark-dim">
          <p>
            {BUSINESS.city}, {BUSINESS.state}
          </p>
          <p>WhatsApp {BUSINESS.whatsapp.display}</p>
          <p>{BUSINESS.instagram.handle}</p>
        </div>
      </header>

      {/* Categorías en dos columnas */}
      <div className="carta-cols mt-5">
        {MENU.map((cat) => (
          <section key={cat.id} className="carta-cat">
            <h2 className="border-b border-green/30 pb-1 font-display text-[15px] font-bold tracking-tight text-bean">
              {cat.name}
            </h2>
            {cat.optionGroups && <CategoryOptions groups={cat.optionGroups} />}
            <ul className="mt-2 space-y-2">
              {cat.items.map((item) => (
                <PrintItem key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* Pie */}
      <footer className="mt-auto pt-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[12px] bg-bean px-5 py-3 text-[10.5px] text-on-dark">
          <span>{BUSINESS.address}</span>
          <span>WhatsApp {BUSINESS.whatsapp.display}</span>
          <span>{BUSINESS.instagram.handle}</span>
        </div>
        <p className="mt-2 text-center text-[10px] text-ink-soft">
          Precios en pesos mexicanos (MXN). Horario: {BUSINESS.hours[0].days},{" "}
          {BUSINESS.hours[0].time}. Martes cerrado.
        </p>
      </footer>
    </div>
  );
}

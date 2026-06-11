"use client";

import { Check, X } from "@phosphor-icons/react";
import { formatMXN, type MenuCategory, type MenuItem } from "@/models/menu.types";
import { useCart } from "@/viewmodels/useCart";
import { useProductDraft } from "@/viewmodels/useProductDraft";
import { ModalShell } from "./ModalShell";
import { QtyStepper } from "./QtyStepper";

interface ProductSheetProps {
  item: MenuItem;
  category: MenuCategory;
  open: boolean;
  onClose: () => void;
}

function Chip({
  label,
  selected,
  onClick,
  trailing,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  trailing?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`pressable inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-2 text-sm font-medium transition-colors ${
        selected
          ? "border-green bg-green text-on-dark"
          : "border-[var(--line-strong)] text-ink hover:border-green/50"
      }`}
    >
      {selected && <Check size={14} weight="bold" />}
      {label}
      {trailing && (
        <span className={selected ? "text-on-dark/90" : "text-ink-soft"}>
          {trailing}
        </span>
      )}
    </button>
  );
}

export function ProductSheet({ item, category, open, onClose }: ProductSheetProps) {
  const addLine = useCart((s) => s.addLine);
  const {
    spec,
    draft,
    unitPrice,
    complete,
    setFlavor,
    setSize,
    toggleIngredient,
    toggleExtra,
    setQty,
    setNote,
    reset,
  } = useProductDraft(item, category);

  const handleAdd = () => {
    addLine({
      itemId: item.id,
      categoryId: category.id,
      name: item.name,
      unitPrice,
      qty: draft.qty,
      variantLabel: draft.variantLabel,
      flavor: draft.flavor,
      ingredients: spec.needsIngredients ? draft.ingredients : undefined,
      extra: spec.addOn ? draft.extra : undefined,
      extraLabel: spec.addOn?.label,
      note: draft.note.trim() || undefined,
    });
    reset();
    onClose();
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      label={`Configurar ${item.name}`}
      align="bottom"
      zIndex="var(--z-sheet)"
    >
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-0.5 text-sm text-ink-soft">{item.description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="pressable -mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-soft hover:text-ink"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      {/* Cuerpo */}
      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        {spec.needsFlavor && (
          <section>
            <h4 className="font-display text-base font-semibold text-bean">
              Elige un sabor
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {spec.flavorOptions.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  selected={draft.flavor === f}
                  onClick={() => setFlavor(f)}
                />
              ))}
            </div>
          </section>
        )}

        {spec.needsSize && (
          <section>
            <h4 className="font-display text-base font-semibold text-bean">
              Tamaño
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {spec.sizeOptions.map((s) => (
                <Chip
                  key={s.label}
                  label={s.label}
                  trailing={formatMXN(s.price)}
                  selected={draft.variantLabel === s.label}
                  onClick={() => setSize(s.label)}
                />
              ))}
            </div>
          </section>
        )}

        {spec.needsIngredients && (
          <section>
            <div className="flex items-baseline justify-between">
              <h4 className="font-display text-base font-semibold text-bean">
                Elige tus ingredientes
              </h4>
              <span className="text-sm font-medium tabular-nums text-ink-soft">
                {draft.ingredients.length} / {spec.ingredientCount}
              </span>
            </div>
            <div className="mt-3 space-y-3">
              {spec.ingredientGroups.map((group) => (
                <div key={group.label}>
                  <p className="hand text-xl text-green-soft">{group.label}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {group.options.map((opt) => (
                      <Chip
                        key={opt}
                        label={opt}
                        selected={draft.ingredients.includes(opt)}
                        onClick={() => toggleIngredient(opt)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {spec.addOn && (
          <section>
            <button
              type="button"
              aria-pressed={draft.extra}
              onClick={toggleExtra}
              className={`flex w-full items-center justify-between gap-3 rounded-card border px-4 py-3 text-left transition-colors ${
                draft.extra
                  ? "border-green bg-green/8"
                  : "border-[var(--line)] hover:border-green/40"
              }`}
            >
              <span>
                <span className="font-medium text-ink">{spec.addOn.label}</span>
                <span className="ml-2 text-sm text-ink-soft">
                  + {formatMXN(spec.addOn.price)}
                </span>
              </span>
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-pill border ${
                  draft.extra
                    ? "border-green bg-green text-on-dark"
                    : "border-[var(--line-strong)]"
                }`}
              >
                {draft.extra && <Check size={14} weight="bold" />}
              </span>
            </button>
          </section>
        )}

        <section>
          <label
            htmlFor="product-note"
            className="font-display text-base font-semibold text-bean"
          >
            Comentario (opcional)
          </label>
          <textarea
            id="product-note"
            value={draft.note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Ej. sin azúcar, extra salsa..."
            className="mt-2 w-full resize-none rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-green focus:outline-none"
          />
        </section>
      </div>

      {/* Pie */}
      <div className="flex items-center gap-3 border-t border-[var(--line)] px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <QtyStepper value={draft.qty} onChange={setQty} ariaLabel="Cantidad" />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!complete}
          className="pressable flex flex-1 items-center justify-center gap-2 rounded-pill bg-green px-5 py-3 text-base font-semibold text-on-dark transition-colors hover:bg-bean disabled:cursor-not-allowed disabled:opacity-40"
        >
          Agregar
          <span className="tabular-nums">{formatMXN(unitPrice * draft.qty)}</span>
        </button>
      </div>
    </ModalShell>
  );
}

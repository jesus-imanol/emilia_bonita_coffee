"use client";

import { useState } from "react";
import { Plus, X } from "@phosphor-icons/react";
import type {
  ExtraAddOn,
  MenuItem,
  PriceVariant,
} from "@/models/menu.types";
import type { MenuItemRow } from "@/models/menu.repo";

export interface ProductPayload {
  name: string;
  description: string | null;
  price: number | null;
  variants: PriceVariant[] | null;
  options: string[] | null;
  picks: number | null;
  extra: ExtraAddOn | null;
}

interface SizeRow {
  label: string;
  price: string;
}

const inputCls =
  "w-full rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-green focus:ring-1 focus:ring-green";

type Initial = MenuItemRow | MenuItem;

function getVariants(i?: Initial): PriceVariant[] | null | undefined {
  return i?.variants ?? null;
}

/**
 * VIEW · Formulario completo de producto (precio único o tamaños, sabores con
 * "elige N", extra opcional). Sirve para agregar y para editar.
 */
export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  autoFocusName = false,
}: {
  initial?: Initial;
  submitLabel: string;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancel: () => void;
  autoFocusName?: boolean;
}) {
  const initVariants = getVariants(initial);

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceMode, setPriceMode] = useState<"single" | "sizes">(
    initVariants && initVariants.length ? "sizes" : "single"
  );
  const [price, setPrice] = useState(
    initial?.price != null ? String(initial.price) : ""
  );
  const [sizes, setSizes] = useState<SizeRow[]>(
    initVariants && initVariants.length
      ? initVariants.map((v) => ({ label: v.label, price: String(v.price) }))
      : [{ label: "", price: "" }]
  );
  const [flavors, setFlavors] = useState<string[]>(initial?.options ?? []);
  const [flavorInput, setFlavorInput] = useState("");
  const [pickCount, setPickCount] = useState(initial?.picks ?? 1);
  const [hasExtra, setHasExtra] = useState(Boolean(initial?.extra));
  const [extraLabel, setExtraLabel] = useState(initial?.extra?.label ?? "");
  const [extraPrice, setExtraPrice] = useState(
    initial?.extra?.price != null ? String(initial.extra.price) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFlavor() {
    const f = flavorInput.trim();
    if (f && !flavors.includes(f)) setFlavors([...flavors, f]);
    setFlavorInput("");
  }

  function setSize(i: number, patch: Partial<SizeRow>) {
    setSizes((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const usingSizes = priceMode === "sizes";
    const variants = sizes
      .map((s) => ({ label: s.label.trim(), price: Math.round(Number(s.price)) }))
      .filter((s) => s.label !== "" && Number.isFinite(s.price) && s.price >= 0);

    if (usingSizes && variants.length === 0) {
      setError("Agrega al menos un tamaño con etiqueta y precio.");
      return;
    }
    const priceNum = price.trim() === "" ? null : Math.round(Number(price));
    if (!usingSizes && (priceNum == null || priceNum < 0)) {
      setError("Pon un precio o cambia a “Por tamaños”.");
      return;
    }
    if (!name.trim()) {
      setError("Escribe el nombre del producto.");
      return;
    }

    const extra =
      hasExtra && extraLabel.trim()
        ? { label: extraLabel.trim(), price: Math.round(Number(extraPrice) || 0) }
        : null;

    const payload: ProductPayload = {
      name: name.trim(),
      description: description.trim() || null,
      price: usingSizes ? null : priceNum,
      variants: usingSizes ? variants : null,
      options: flavors.length ? flavors : null,
      picks: flavors.length && pickCount >= 2 ? pickCount : null,
      extra,
    };

    setSaving(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-2 space-y-4 rounded-card border border-green/30 bg-green/5 p-4"
    >
      {/* Nombre + descripción */}
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus={autoFocusName}
          placeholder="Nombre del producto"
          aria-label="Nombre del producto"
          className={inputCls}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción (opcional)"
          aria-label="Descripción"
          className={inputCls}
        />
      </div>

      {/* Precio: único o por tamaños */}
      <div>
        <div className="inline-flex rounded-pill border border-[var(--line)] bg-cream p-0.5">
          {(["single", "sizes"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setPriceMode(m)}
              className={`pressable rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors ${
                priceMode === m ? "bg-green text-on-dark" : "text-ink-soft"
              }`}
            >
              {m === "single" ? "Precio único" : "Por tamaños"}
            </button>
          ))}
        </div>

        {priceMode === "single" ? (
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-sm font-medium text-ink-soft">$</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Precio"
              aria-label="Precio en pesos"
              className="w-28 rounded-input border border-[var(--line)] bg-cream px-2.5 py-2 text-sm font-semibold text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
            />
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            {sizes.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={s.label}
                  onChange={(e) => setSize(i, { label: e.target.value })}
                  placeholder="Tamaño (ej. 12 oz)"
                  aria-label="Etiqueta del tamaño"
                  className="min-w-0 flex-1 rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
                />
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-ink-soft">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={s.price}
                    onChange={(e) => setSize(i, { price: e.target.value })}
                    placeholder="Precio"
                    aria-label="Precio del tamaño"
                    className="w-20 rounded-input border border-[var(--line)] bg-cream px-2.5 py-2 text-sm font-semibold text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
                  />
                </div>
                {sizes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))}
                    aria-label="Quitar tamaño"
                    className="pressable inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-terracotta hover:bg-terracotta/10"
                  >
                    <X size={15} weight="bold" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSizes([...sizes, { label: "", price: "" }])}
              className="pressable inline-flex items-center gap-1 text-sm font-semibold text-green"
            >
              <Plus size={14} weight="bold" />
              Agregar tamaño
            </button>
          </div>
        )}
      </div>

      {/* Sabores (opcional) */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">
          Sabores <span className="font-normal normal-case">(opcional)</span>
        </p>
        {flavors.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {flavors.map((f) => (
              <li
                key={f}
                className="inline-flex items-center gap-1 rounded-pill bg-green/10 py-1 pl-3 pr-1 text-xs font-medium text-ink"
              >
                {f}
                <button
                  type="button"
                  onClick={() => setFlavors(flavors.filter((x) => x !== f))}
                  aria-label={`Quitar ${f}`}
                  className="pressable inline-flex h-5 w-5 items-center justify-center rounded-pill text-ink-soft hover:text-terracotta"
                >
                  <X size={12} weight="bold" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex items-center gap-2">
          <input
            value={flavorInput}
            onChange={(e) => setFlavorInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFlavor();
              }
            }}
            placeholder="Ej. Capuchino"
            aria-label="Agregar sabor"
            className="min-w-0 flex-1 rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
          />
          <button
            type="button"
            onClick={addFlavor}
            className="pressable rounded-pill border border-green/40 px-3 py-2 text-sm font-semibold text-green transition-colors hover:bg-green/8"
          >
            Agregar
          </button>
        </div>

        {flavors.length > 0 && (
          <div className="mt-2.5 flex items-center gap-2 text-sm">
            <span className="text-ink-soft">El cliente elige</span>
            <select
              value={pickCount}
              onChange={(e) => setPickCount(Number(e.target.value))}
              aria-label="Cuántos sabores elige el cliente"
              className="rounded-input border border-[var(--line)] bg-cream px-2 py-1.5 text-sm font-semibold text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-ink-soft">
              {pickCount === 1 ? "sabor" : "sabores"}
            </span>
          </div>
        )}
      </div>

      {/* Extra opcional */}
      <div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={hasExtra}
            onChange={(e) => setHasExtra(e.target.checked)}
            className="h-4 w-4 accent-[var(--green)]"
          />
          Tiene un extra opcional con cargo
        </label>
        {hasExtra && (
          <div className="mt-2 flex items-center gap-2">
            <input
              value={extraLabel}
              onChange={(e) => setExtraLabel(e.target.value)}
              placeholder="Ej. Leche deslactosada"
              aria-label="Etiqueta del extra"
              className="min-w-0 flex-1 rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
            />
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-ink-soft">+$</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={extraPrice}
                onChange={(e) => setExtraPrice(e.target.value)}
                placeholder="0"
                aria-label="Precio del extra"
                className="w-20 rounded-input border border-[var(--line)] bg-cream px-2.5 py-2 text-sm font-semibold text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-terracotta">
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="pressable rounded-pill bg-green px-4 py-2 text-sm font-semibold text-on-dark transition-colors hover:bg-bean disabled:opacity-50"
        >
          {saving ? "Guardando…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="pressable rounded-pill px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

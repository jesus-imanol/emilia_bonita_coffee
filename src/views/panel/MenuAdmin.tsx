"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash, X } from "@phosphor-icons/react";
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  saveMenuItem,
  seedMenu,
} from "@/app/panel/actions";
import type { MenuCategoryRow, MenuItemRow } from "@/models/menu.repo";
import { ConfirmDialog } from "./ConfirmDialog";

const inputCls =
  "w-full rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-green focus:ring-1 focus:ring-green";

export function MenuAdmin({
  categories,
  items,
}: {
  categories: MenuCategoryRow[];
  items: MenuItemRow[];
}) {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const empty = items.length === 0 && categories.length === 0;

  async function onSeed() {
    setSeeding(true);
    setError(null);
    try {
      await seedMenu();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo sembrar la carta.");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <a
        href="/panel/admin"
        className="pressable inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} weight="bold" />
        Volver al panel
      </a>

      <header className="mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Carta</h1>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-soft">
          Edita, agrega o quita productos y categorías. Todo se refleja en el
          sitio web, el PDF y los pedidos.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-input border border-terracotta/30 bg-terracotta/10 px-3.5 py-2.5 text-sm font-medium text-terracotta"
        >
          {error}
        </p>
      )}

      {empty ? (
        <div className="mt-10 rounded-card border border-[var(--line)] bg-cream-deep/40 p-8 text-center">
          <p className="font-semibold text-ink">Aún no hay carta cargada.</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">
            Siémbrala una sola vez con la carta actual del menú y después podrás
            editarla aquí.
          </p>
          <button
            type="button"
            onClick={onSeed}
            disabled={seeding}
            className="pressable mt-5 inline-flex items-center justify-center rounded-pill bg-green px-5 py-2.5 text-sm font-semibold text-on-dark transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {seeding ? "Sembrando…" : "Sembrar carta"}
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-9">
          {categories.map((cat) => (
            <CategorySection
              key={cat.id}
              cat={cat}
              items={items.filter((i) => i.category_id === cat.id)}
            />
          ))}

          <AddCategory />
        </div>
      )}
    </main>
  );
}

function CategorySection({
  cat,
  items,
}: {
  cat: MenuCategoryRow;
  items: MenuItemRow[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);

  async function onDelete() {
    setDeleting(true);
    setDelError(null);
    try {
      await deleteCategory(cat.id);
      setConfirmDel(false);
      router.refresh();
    } catch (err) {
      setDelError(err instanceof Error ? err.message : "No se pudo borrar.");
      setDeleting(false);
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
          {cat.name}
        </h2>
        <button
          type="button"
          onClick={() => setConfirmDel(true)}
          className="pressable inline-flex items-center gap-1 rounded-pill px-2 py-1 text-xs font-medium text-terracotta transition-colors hover:bg-terracotta/10"
        >
          <Trash size={14} weight="bold" />
          Categoría
        </button>
      </div>

      <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-card border border-[var(--line)] bg-cream">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
        {items.length === 0 && (
          <li className="px-3 py-4 text-center text-sm text-ink-soft">
            Sin productos todavía.
          </li>
        )}
      </ul>

      {adding ? (
        <AddItem categoryId={cat.id} onDone={() => setAdding(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="pressable mt-2 inline-flex items-center gap-1.5 rounded-pill border border-green/40 px-3.5 py-1.5 text-sm font-semibold text-green transition-colors hover:bg-green/8"
        >
          <Plus size={15} weight="bold" />
          Agregar producto
        </button>
      )}

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={onDelete}
        title={`Borrar “${cat.name}”`}
        message="Se borrará la categoría y todos sus productos. Esta acción no se puede deshacer."
        confirmLabel="Sí, borrar"
        cancelLabel="No"
        danger
        loading={deleting}
        error={delError}
      />
    </section>
  );
}

function ItemRow({ item }: { item: MenuItemRow }) {
  const router = useRouter();
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price?.toString() ?? "");
  const [active, setActive] = useState(item.active);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasVariants = Boolean(item.variants?.length);
  const dirty =
    name !== item.name ||
    price !== (item.price?.toString() ?? "") ||
    active !== item.active;

  async function onSave() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await saveMenuItem(item.id, {
        name: name.trim() || item.name,
        price: price.trim() === "" ? null : Math.round(Number(price)),
        description: item.description,
        active,
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await deleteMenuItem(item.id);
      setConfirmDel(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar.");
      setDeleting(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3 sm:flex-nowrap">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Nombre del producto"
        className="min-w-0 flex-1 rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm font-medium text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
      />

      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-ink-soft">$</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          aria-label="Precio en pesos"
          placeholder={hasVariants ? "var." : ""}
          title={hasVariants ? "Este producto tiene precios por variante" : undefined}
          className="w-20 rounded-input border border-[var(--line)] bg-cream px-2.5 py-2 text-sm font-semibold text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
        />
      </div>

      <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="h-4 w-4 accent-[var(--green)]"
        />
        Disponible
      </label>

      <button
        type="button"
        onClick={onSave}
        disabled={!dirty || saving}
        className="pressable shrink-0 rounded-pill bg-ink px-4 py-2 text-sm font-semibold text-on-dark transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {saving ? "Guardando…" : saved && !dirty ? "Guardado" : "Guardar"}
      </button>

      <button
        type="button"
        onClick={() => setConfirmDel(true)}
        aria-label={`Borrar ${item.name}`}
        className="pressable inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-terracotta transition-colors hover:bg-terracotta/10"
      >
        <Trash size={16} weight="bold" />
      </button>

      {error && (
        <p role="alert" className="basis-full text-xs font-medium text-terracotta">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        onConfirm={onDelete}
        title={`Borrar “${item.name}”`}
        message="El producto se quitará de la carta, el PDF y los pedidos nuevos."
        confirmLabel="Sí, borrar"
        cancelLabel="No"
        danger
        loading={deleting}
      />
    </li>
  );
}

interface SizeRow {
  label: string;
  price: string;
}

function AddItem({
  categoryId,
  onDone,
}: {
  categoryId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceMode, setPriceMode] = useState<"single" | "sizes">("single");
  const [price, setPrice] = useState("");
  const [sizes, setSizes] = useState<SizeRow[]>([{ label: "", price: "" }]);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [flavorInput, setFlavorInput] = useState("");
  const [pickCount, setPickCount] = useState(1);
  const [hasExtra, setHasExtra] = useState(false);
  const [extraLabel, setExtraLabel] = useState("");
  const [extraPrice, setExtraPrice] = useState("");
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

  async function onSubmit(e: React.FormEvent) {
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

    const extra =
      hasExtra && extraLabel.trim()
        ? {
            label: extraLabel.trim(),
            price: Math.round(Number(extraPrice) || 0),
          }
        : null;

    setSaving(true);
    try {
      await createMenuItem({
        categoryId,
        name,
        description: description.trim() || null,
        price: usingSizes ? null : priceNum,
        variants: usingSizes ? variants : null,
        options: flavors.length ? flavors : null,
        picks: flavors.length ? pickCount : null,
        extra,
      });
      onDone();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo agregar.");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-2 space-y-4 rounded-card border border-green/30 bg-green/5 p-4"
    >
      {/* Nombre + descripción */}
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
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
          {saving ? "Agregando…" : "Agregar producto"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="pressable rounded-pill px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function AddCategory() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createCategory({ name, tagline });
      setName("");
      setTagline("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear.");
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pressable inline-flex items-center gap-1.5 rounded-pill border border-[var(--line)] px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-green/40"
      >
        <Plus size={16} weight="bold" />
        Nueva categoría
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-card border border-green/30 bg-green/5 p-4"
    >
      <h2 className="text-sm font-bold text-ink">Nueva categoría</h2>
      <div className="mt-3 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          placeholder="Nombre (ej. Postres)"
          aria-label="Nombre de la categoría"
          className={inputCls}
        />
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Subtítulo (opcional)"
          aria-label="Subtítulo de la categoría"
          className={inputCls}
        />
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-terracotta">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="pressable rounded-pill bg-green px-4 py-2 text-sm font-semibold text-on-dark transition-colors hover:bg-bean disabled:opacity-50"
        >
          {saving ? "Creando…" : "Crear categoría"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="pressable rounded-pill px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

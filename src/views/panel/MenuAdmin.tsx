"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash, PencilSimple } from "@phosphor-icons/react";
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
import { ProductForm } from "./ProductForm";

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
  const [editing, setEditing] = useState(false);
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

  // Editor completo (tamaños, sabores, extra…).
  if (editing) {
    return (
      <li className="p-3">
        <p className="mb-1 text-xs font-semibold text-ink-soft">
          Editar {item.name}
        </p>
        <ProductForm
          initial={item}
          submitLabel="Guardar cambios"
          onCancel={() => setEditing(false)}
          onSubmit={async (p) => {
            await saveMenuItem(item.id, {
              name: p.name,
              description: p.description,
              price: p.price,
              active,
              variants: p.variants,
              options: p.options,
              picks: p.picks,
              extra: p.extra,
            });
            setEditing(false);
            router.refresh();
          }}
        />
      </li>
    );
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
          title={hasVariants ? "Tiene precios por tamaño · edítalos con el lápiz" : undefined}
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
        onClick={() => setEditing(true)}
        aria-label={`Editar detalles de ${item.name}`}
        title="Editar tamaños, sabores y extra"
        className="pressable inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-soft transition-colors hover:bg-cream-deep/50 hover:text-ink"
      >
        <PencilSimple size={16} weight="bold" />
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

function AddItem({
  categoryId,
  onDone,
}: {
  categoryId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  return (
    <ProductForm
      submitLabel="Agregar producto"
      autoFocusName
      onCancel={onDone}
      onSubmit={async (p) => {
        await createMenuItem({ categoryId, ...p });
        onDone();
        router.refresh();
      }}
    />
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

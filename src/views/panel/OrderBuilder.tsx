"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash } from "@phosphor-icons/react";
import { formatMXN, type MenuCategory } from "@/models/menu.types";
import { lineTotal, type CartLine } from "@/models/cart.types";
import {
  useOrderDraft,
  useOrderDraftCount,
  useOrderDraftSubtotal,
} from "@/viewmodels/useOrderDraft";
import { createOrder, updateOrderItems } from "@/app/panel/actions";
import { QtyStepper } from "@/views/components/QtyStepper";
import { OrderItemPicker } from "./OrderItemPicker";
import { OrderToast } from "./OrderToast";

interface OrderBuilderProps {
  menu: MenuCategory[];
  mode: "create" | "edit";
  orderId?: string;
  initial?: { customerName: string; note: string; lines: CartLine[] };
}

function lineDetail(l: CartLine): string {
  const parts: string[] = [];
  if (l.variantLabel) parts.push(l.variantLabel);
  if (l.flavor) parts.push(l.flavor);
  if (l.ingredients?.length) parts.push(l.ingredients.join(", "));
  if (l.extra && l.extraLabel) parts.push(`+ ${l.extraLabel}`);
  if (l.note) parts.push(`“${l.note}”`);
  return parts.join(" · ");
}

export function OrderBuilder({ menu, mode, orderId, initial }: OrderBuilderProps) {
  const router = useRouter();
  const customerName = useOrderDraft((s) => s.customerName);
  const note = useOrderDraft((s) => s.note);
  const lines = useOrderDraft((s) => s.lines);
  const setCustomerName = useOrderDraft((s) => s.setCustomerName);
  const setNote = useOrderDraft((s) => s.setNote);
  const updateQty = useOrderDraft((s) => s.updateQty);
  const removeLine = useOrderDraft((s) => s.removeLine);
  const init = useOrderDraft((s) => s.init);
  const reset = useOrderDraft((s) => s.reset);

  const subtotal = useOrderDraftSubtotal();
  const count = useOrderDraftCount();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializa el draft una sola vez al montar.
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (mode === "edit" && initial) {
      init(initial);
    } else {
      reset();
    }
  }, [mode, initial, init, reset]);

  const canSubmit = customerName.trim().length > 0 && lines.length > 0 && !submitting;

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "create") {
        const { id } = await createOrder({ customerName, note, lines });
        reset();
        router.replace(`/panel/mesera/${id}`);
      } else if (orderId) {
        await updateOrderItems({ orderId, customerName, note, lines });
        router.replace(`/panel/mesera/${orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el pedido.");
      setSubmitting(false);
    }
  }

  function scrollToCat(id: string) {
    document.getElementById(`ob-cat-${id}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 pb-32 pt-6">
      <OrderToast />

      <Link
        href={mode === "edit" && orderId ? `/panel/mesera/${orderId}` : "/panel/mesera"}
        className="pressable inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} weight="bold" />
        {mode === "edit" ? "Volver al pedido" : "Mis pedidos"}
      </Link>

      <h1 className="mt-3 text-xl font-bold tracking-tight text-ink">
        {mode === "edit" ? "Corregir pedido" : "Nuevo pedido"}
      </h1>

      {/* Cliente */}
      <section className="mt-5">
        <label
          htmlFor="ob-customer"
          className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft"
        >
          Cliente
        </label>
        <input
          id="ob-customer"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nombre del cliente"
          autoComplete="off"
          className="mt-2 w-full rounded-input border border-[var(--line)] bg-cream px-3.5 py-2.5 text-base font-medium text-ink outline-none focus:border-green focus:ring-1 focus:ring-green"
        />
      </section>

      {/* Navegación de categorías */}
      <nav className="sticky top-0 z-10 -mx-4 mt-6 flex gap-2 overflow-x-auto border-b border-[var(--line)] bg-cream/95 px-4 py-2.5 backdrop-blur-[2px] [scrollbar-width:none]">
        {menu.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => scrollToCat(cat.id)}
            className="pressable shrink-0 rounded-pill border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-green/40 hover:text-ink"
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Carta */}
      <div className="mt-4 space-y-7">
        {menu.map((cat) => (
          <section key={cat.id} id={`ob-cat-${cat.id}`} className="scroll-mt-16">
            <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              {cat.name}
            </h2>
            <div className="mt-1 divide-y divide-[var(--line)]">
              {cat.items.map((item) => (
                <OrderItemPicker key={item.id} item={item} category={cat} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Pedido en curso */}
      <section className="mt-9">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
          Pedido {count > 0 && <span className="text-green">· {count}</span>}
        </h2>

        {lines.length === 0 ? (
          <p className="mt-3 rounded-card border border-dashed border-[var(--line)] bg-cream-deep/30 px-4 py-6 text-center text-sm text-ink-soft">
            Aún no agregas productos. Toca <b className="text-ink">Agregar</b> en
            la carta de arriba.
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {lines.map((l) => (
              <li
                key={l.lineId}
                className="rounded-card border border-[var(--line)] bg-cream p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{l.name}</p>
                    {lineDetail(l) && (
                      <p className="mt-0.5 text-xs leading-snug text-ink-soft">
                        {lineDetail(l)}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
                    {formatMXN(lineTotal(l))}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <QtyStepper
                    value={l.qty}
                    min={1}
                    onChange={(q) => updateQty(l.lineId, q)}
                    ariaLabel={`Cantidad de ${l.name}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeLine(l.lineId)}
                    className="pressable inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1.5 text-xs font-medium text-terracotta transition-colors hover:bg-terracotta/10"
                  >
                    <Trash size={15} weight="bold" />
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Nota del pedido */}
        <div className="mt-4">
          <label
            htmlFor="ob-note"
            className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft"
          >
            Nota del pedido (opcional)
          </label>
          <textarea
            id="ob-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Ej. para llevar, sin cubiertos…"
            className="mt-2 w-full resize-none rounded-input border border-[var(--line)] bg-cream px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/70 outline-none focus:border-green focus:ring-1 focus:ring-green"
          />
        </div>
      </section>

      {/* Barra de acción fija */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-cream/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-[2px]">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <div className="leading-tight">
            <p className="text-xs text-ink-soft">Total</p>
            <p className="text-lg font-bold tabular-nums text-ink">
              {formatMXN(subtotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="pressable flex flex-1 items-center justify-center rounded-pill bg-green px-5 py-3 text-base font-semibold text-on-dark transition-colors hover:bg-bean disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? "Guardando…"
              : mode === "edit"
                ? "Guardar cambios"
                : "Enviar pedido"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mx-auto mt-2 max-w-md text-center text-xs font-medium text-terracotta">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

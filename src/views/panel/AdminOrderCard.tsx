"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Money, XCircle } from "@phosphor-icons/react";
import { formatMXN } from "@/models/menu.types";
import type { OrderItemRow } from "@/models/orderItem.map";
import { formatOrderTime, type OrderWithItems } from "@/models/order.types";
import { cancelarOrder } from "@/app/panel/actions";
import { PaymentDialog } from "./PaymentDialog";
import { ConfirmDialog } from "./ConfirmDialog";

function describe(it: OrderItemRow): string {
  const parts: string[] = [];
  if (it.variant_label) parts.push(it.variant_label);
  if (it.flavor) parts.push(it.flavor);
  if (it.ingredients?.length) parts.push(it.ingredients.join(", "));
  if (it.extra && it.extra_label) parts.push(`+ ${it.extra_label}`);
  if (it.note) parts.push(`“${it.note}”`);
  return parts.join(" · ");
}

export function AdminOrderCard({ order }: { order: OrderWithItems }) {
  const router = useRouter();
  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const items = order.order_items ?? [];

  async function onConfirmCancel() {
    setCanceling(true);
    setError(null);
    try {
      await cancelarOrder(order.id);
      setCancelOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cancelar.");
      setCanceling(false);
    }
  }

  return (
    <article className="rounded-card border border-[var(--line)] bg-cream p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold text-ink">
            {order.customer_name}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {formatOrderTime(order.created_at)}
          </p>
        </div>
        <span className="shrink-0 text-lg font-bold tabular-nums text-ink">
          {formatMXN(order.total)}
        </span>
      </div>

      <ul className="mt-3 space-y-1 border-t border-[var(--line)] pt-3">
        {items.map((it) => (
          <li key={it.id} className="flex justify-between gap-3 text-sm">
            <span className="min-w-0 text-ink">
              <span className="font-semibold tabular-nums">{it.qty}×</span>{" "}
              {it.name}
              {describe(it) && (
                <span className="text-ink-soft"> · {describe(it)}</span>
              )}
            </span>
            <span className="shrink-0 tabular-nums text-ink-soft">
              {formatMXN(it.line_total)}
            </span>
          </li>
        ))}
      </ul>

      {order.note && (
        <p className="mt-2 text-xs text-ink-soft">Nota: {order.note}</p>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPayOpen(true)}
          className="pressable inline-flex flex-1 items-center justify-center gap-2 rounded-pill bg-green px-4 py-2.5 text-sm font-semibold text-on-dark transition-colors hover:bg-bean"
        >
          <Money size={17} weight="bold" />
          Cobrar
        </button>
        <button
          type="button"
          onClick={() => setCancelOpen(true)}
          className="pressable inline-flex items-center justify-center gap-1.5 rounded-pill border border-[var(--line)] px-3.5 py-2.5 text-sm font-medium text-terracotta transition-colors hover:bg-terracotta/10"
        >
          <XCircle size={17} weight="bold" />
          Cancelar
        </button>
      </div>

      <PaymentDialog
        open={payOpen}
        onClose={() => setPayOpen(false)}
        orderId={order.id}
        customerName={order.customer_name}
        total={order.total}
      />

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={onConfirmCancel}
        title="Cancelar pedido"
        message={`El pedido de ${order.customer_name} (${formatMXN(
          order.total
        )}) se marcará como cancelado y saldrá de pendientes.`}
        confirmLabel="Sí, cancelar"
        cancelLabel="No"
        danger
        loading={canceling}
        error={error}
      />
    </article>
  );
}

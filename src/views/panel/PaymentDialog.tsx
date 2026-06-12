"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Money, ArrowsLeftRight, Check, X } from "@phosphor-icons/react";
import { formatMXN } from "@/models/menu.types";
import type { PaymentMethod } from "@/models/order.types";
import { cobrarOrder } from "@/app/panel/actions";
import { ModalShell } from "@/views/components/ModalShell";

const METHODS: { value: PaymentMethod; label: string; icon: typeof Money }[] = [
  { value: "efectivo", label: "Efectivo", icon: Money },
  { value: "transferencia", label: "Transferencia", icon: ArrowsLeftRight },
];

export function PaymentDialog({
  open,
  onClose,
  orderId,
  customerName,
  total,
}: {
  open: boolean;
  onClose: () => void;
  orderId: string;
  customerName: string;
  total: number;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("efectivo");
  const [received, setReceived] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cierra y reinicia el estado (cubre backdrop, Esc, X y tras cobrar).
  function handleClose() {
    setReceived("");
    setError(null);
    setMethod("efectivo");
    onClose();
  }

  const receivedNum = received.trim() === "" ? null : Number(received);
  const cambio = receivedNum != null ? receivedNum - total : null;
  const insufficient = receivedNum != null && receivedNum < total;
  const quickBills = [50, 100, 200, 500, 1000].filter((b) => b > total).slice(0, 3);
  const confirmDisabled =
    submitting || (method === "efectivo" && insufficient);

  async function confirm() {
    setSubmitting(true);
    setError(null);
    try {
      await cobrarOrder(orderId, method);
      handleClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cobrar.");
      setSubmitting(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={handleClose}
      label={`Cobrar pedido de ${customerName}`}
      align="bottom"
      zIndex="var(--z-sheet)"
    >
      <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
        <div>
          <h3 className="text-lg font-bold text-ink">Cobrar pedido</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{customerName}</p>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Cerrar"
          className="pressable -mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill text-ink-soft hover:text-ink"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      <div className="space-y-6 px-5 py-5">
        <div className="rounded-card bg-bean px-4 py-4 text-center text-on-dark">
          <p className="text-xs uppercase tracking-wide text-on-dark-dim">
            Total a cobrar
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {formatMXN(total)}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            Método de pago
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {METHODS.map((m) => {
              const Icon = m.icon;
              const selected = method === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMethod(m.value)}
                  className={`pressable flex flex-col items-center gap-2 rounded-card border px-4 py-4 text-sm font-semibold transition-colors ${
                    selected
                      ? "border-green bg-green/10 text-green"
                      : "border-[var(--line)] text-ink hover:border-green/40"
                  }`}
                >
                  <Icon size={24} weight={selected ? "fill" : "regular"} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {method === "efectivo" && (
          <div>
            <label
              htmlFor="pay-cash"
              className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft"
            >
              ¿Con cuánto paga?
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-input border border-[var(--line)] bg-cream px-3.5 py-2.5 focus-within:border-green focus-within:ring-1 focus-within:ring-green">
              <span className="text-lg font-semibold text-ink-soft">$</span>
              <input
                id="pay-cash"
                type="number"
                inputMode="numeric"
                min={0}
                value={received}
                onChange={(e) => setReceived(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-lg font-semibold text-ink outline-none"
              />
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setReceived(String(total))}
                className="pressable rounded-pill border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-green/40 hover:text-ink"
              >
                Exacto
              </button>
              {quickBills.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setReceived(String(b))}
                  className="pressable rounded-pill border border-[var(--line)] px-3 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-green/40 hover:text-ink"
                >
                  {formatMXN(b)}
                </button>
              ))}
            </div>

            {cambio != null &&
              (insufficient ? (
                <p className="mt-3 text-sm font-semibold text-terracotta">
                  Faltan {formatMXN(total - receivedNum!)}
                </p>
              ) : (
                <div className="mt-3 flex items-center justify-between rounded-card bg-green/10 px-4 py-3">
                  <span className="text-sm font-semibold text-green">
                    Cambio
                  </span>
                  <span className="text-2xl font-bold tabular-nums text-green">
                    {formatMXN(cambio)}
                  </span>
                </div>
              ))}
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-terracotta">
            {error}
          </p>
        )}
      </div>

      <div className="border-t border-[var(--line)] px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <button
          type="button"
          onClick={confirm}
          disabled={confirmDisabled}
          className="pressable flex w-full items-center justify-center gap-2 rounded-pill bg-green px-5 py-3 text-base font-semibold text-on-dark transition-colors hover:bg-bean disabled:opacity-50"
        >
          <Check size={18} weight="bold" />
          {submitting ? "Cobrando…" : "Confirmar cobro"}
        </button>
      </div>
    </ModalShell>
  );
}

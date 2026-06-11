"use client";

import { useState } from "react";
import { ShoppingBagOpen, Trash, WhatsappLogo, X } from "@phosphor-icons/react";
import { formatMXN } from "@/models/menu.types";
import {
  lineTotal,
  type CartLine,
  type OrderDetails,
} from "@/models/cart.types";
import { buildWhatsAppUrl } from "@/models/order";
import { useCart, useCartSubtotal } from "@/viewmodels/useCart";
import { ModalShell } from "./ModalShell";
import { QtyStepper } from "./QtyStepper";

function lineConfig(line: CartLine): string {
  const bits: string[] = [];
  if (line.variantLabel) bits.push(line.variantLabel);
  if (line.flavor) bits.push(line.flavor);
  if (line.ingredients?.length) bits.push(line.ingredients.join(", "));
  if (line.extra && line.extraLabel) bits.push(line.extraLabel);
  return bits.join(", ");
}

export function CartDrawer() {
  const isOpen = useCart((s) => s.isDrawerOpen);
  const closeDrawer = useCart((s) => s.closeDrawer);
  const lines = useCart((s) => s.lines);
  const updateQty = useCart((s) => s.updateQty);
  const removeLine = useCart((s) => s.removeLine);
  const clearCart = useCart((s) => s.clearCart);
  const subtotal = useCartSubtotal();
  const [details, setDetails] = useState<OrderDetails>({});

  const href = lines.length ? buildWhatsAppUrl(lines, details) : "#";

  return (
    <ModalShell
      open={isOpen}
      onClose={closeDrawer}
      label="Tu pedido"
      align="right"
      zIndex="var(--z-cart)"
    >
      <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
        <h3 className="font-display text-xl font-semibold text-ink">
          Tu pedido
        </h3>
        <button
          type="button"
          onClick={closeDrawer}
          aria-label="Cerrar"
          className="pressable -mr-1 inline-flex h-9 w-9 items-center justify-center rounded-pill text-ink-soft hover:text-ink"
        >
          <X size={20} weight="bold" />
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <ShoppingBagOpen size={44} weight="duotone" className="text-green-soft" />
          <p className="mt-4 font-display text-lg font-semibold text-ink">
            Tu carrito está vacío
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Arma tu pedido desde la carta y lo envías por WhatsApp.
          </p>
          <a
            href="#menu"
            onClick={closeDrawer}
            className="pressable mt-6 inline-flex items-center rounded-pill bg-green px-5 py-3 text-sm font-semibold text-on-dark hover:bg-bean"
          >
            Ver la carta
          </a>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <ul className="space-y-4">
              {lines.map((line) => {
                const config = lineConfig(line);
                return (
                  <li
                    key={line.lineId}
                    className="flex gap-3 border-b border-[var(--line)] pb-4 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-display font-semibold leading-tight text-ink">
                        {line.name}
                      </p>
                      {config && (
                        <p className="mt-0.5 text-sm text-ink-soft">{config}</p>
                      )}
                      {line.note && (
                        <p className="mt-0.5 text-sm italic text-ink-soft">
                          {line.note}
                        </p>
                      )}
                      <div className="mt-2.5 flex items-center gap-3">
                        <QtyStepper
                          size="sm"
                          min={0}
                          value={line.qty}
                          onChange={(q) => updateQty(line.lineId, q)}
                          ariaLabel={`Cantidad de ${line.name}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeLine(line.lineId)}
                          aria-label={`Quitar ${line.name}`}
                          className="pressable inline-flex h-8 w-8 items-center justify-center rounded-pill text-ink-soft hover:text-terracotta"
                        >
                          <Trash size={17} weight="bold" />
                        </button>
                      </div>
                    </div>
                    <span className="shrink-0 font-display font-semibold tabular-nums text-green">
                      {formatMXN(lineTotal(line))}
                    </span>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={clearCart}
              className="pressable mt-4 text-sm font-medium text-ink-soft underline underline-offset-2 hover:text-ink"
            >
              Vaciar carrito
            </button>
          </div>

          {/* Datos + envío */}
          <div className="space-y-3 border-t border-[var(--line)] px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-ink">Nombre</span>
                <input
                  type="text"
                  value={details.name ?? ""}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder="Opcional"
                  className="mt-1 w-full rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-green focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">Comentario</span>
                <input
                  type="text"
                  value={details.comment ?? ""}
                  onChange={(e) =>
                    setDetails((d) => ({ ...d, comment: e.target.value }))
                  }
                  placeholder="Opcional"
                  className="mt-1 w-full rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink placeholder:text-ink-soft/70 focus:border-green focus:outline-none"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-base font-medium text-ink">Subtotal</span>
              <span className="font-display text-xl font-bold tabular-nums text-bean">
                {formatMXN(subtotal)}
              </span>
            </div>

            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeDrawer}
              className="pressable flex w-full items-center justify-center gap-2 rounded-pill bg-green px-5 py-3.5 text-base font-semibold text-on-dark transition-colors hover:bg-bean"
            >
              <WhatsappLogo size={20} weight="bold" />
              Enviar pedido por WhatsApp
            </a>
            <p className="text-center text-xs text-ink-soft">
              Se abre WhatsApp con tu pedido listo. Tú indicas ahí si es para
              llevar, en mesa o a domicilio.
            </p>
          </div>
        </>
      )}
    </ModalShell>
  );
}

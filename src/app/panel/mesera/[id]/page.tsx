import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  PencilSimple,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/models/menu.types";
import type { OrderItemRow } from "@/models/orderItem.map";
import { formatOrderDateTime, type OrderWithItems } from "@/models/order.types";
import { StatusBadge } from "@/views/panel/StatusBadge";
import { CobrarButton } from "@/views/panel/CobrarButton";

function describe(it: OrderItemRow): string {
  const parts: string[] = [];
  if (it.variant_label) parts.push(it.variant_label);
  if (it.flavor) parts.push(it.flavor);
  if (it.ingredients?.length) parts.push(it.ingredients.join(", "));
  if (it.extra && it.extra_label) parts.push(`+ ${it.extra_label}`);
  if (it.note) parts.push(`“${it.note}”`);
  return parts.join(" · ");
}

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/panel/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();
  if (!order) notFound();

  const typed = order as OrderWithItems;
  const items = typed.order_items ?? [];
  const isPending = typed.status === "pendiente";

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-28">
      <Link
        href="/panel/mesera"
        className="pressable inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} weight="bold" />
        Mis pedidos
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-ink">
            {typed.customer_name}
          </h1>
          <p className="mt-0.5 text-xs text-ink-soft">
            {formatOrderDateTime(typed.created_at)}
          </p>
        </div>
        <StatusBadge status={typed.status} />
      </div>

      <ul className="mt-5 divide-y divide-[var(--line)] overflow-hidden rounded-card border border-[var(--line)] bg-cream">
        {items.map((it) => (
          <li key={it.id} className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">
                {it.qty}× {it.name}
              </p>
              {describe(it) && (
                <p className="mt-0.5 text-xs leading-snug text-ink-soft">
                  {describe(it)}
                </p>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold tabular-nums text-ink">
              {formatMXN(it.line_total)}
            </span>
          </li>
        ))}
      </ul>

      {typed.note && (
        <p className="mt-3 text-sm text-ink-soft">Nota: {typed.note}</p>
      )}

      <div className="mt-4 flex items-center justify-between rounded-card bg-bean px-4 py-3 text-on-dark">
        <span className="font-semibold">Total</span>
        <span className="text-lg font-bold tabular-nums">
          {formatMXN(typed.total)}
        </span>
      </div>

      {typed.status === "cobrado" && (
        <div className="mt-4 flex items-center gap-3 rounded-card border border-green/30 bg-green/10 px-4 py-3">
          <CheckCircle size={22} weight="fill" className="shrink-0 text-green" />
          <div className="text-sm">
            <p className="font-semibold text-green">Pedido cobrado</p>
            <p className="text-ink-soft">
              {typed.payment_method === "transferencia"
                ? "Transferencia"
                : "Efectivo"}
              {typed.paid_at ? ` · ${formatOrderDateTime(typed.paid_at)}` : ""}
            </p>
          </div>
        </div>
      )}

      {typed.status === "cancelado" && (
        <div className="mt-4 flex items-center gap-3 rounded-card border border-terracotta/30 bg-terracotta/10 px-4 py-3">
          <XCircle size={22} weight="fill" className="shrink-0 text-terracotta" />
          <p className="text-sm font-semibold text-terracotta">
            Pedido cancelado
          </p>
        </div>
      )}

      {/* Acción fija: corregir o cobrar mientras esté pendiente */}
      {isPending && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-cream/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          <div className="mx-auto flex max-w-md items-center gap-3">
            <Link
              href={`/panel/mesera/${typed.id}/editar`}
              className="pressable inline-flex items-center justify-center gap-2 rounded-pill border border-green/50 bg-cream px-4 py-3 text-base font-semibold text-green transition-colors hover:bg-green/8"
            >
              <PencilSimple size={18} weight="bold" />
              Corregir
            </Link>
            <CobrarButton
              orderId={typed.id}
              customerName={typed.customer_name}
              total={typed.total}
            />
          </div>
        </div>
      )}
    </main>
  );
}

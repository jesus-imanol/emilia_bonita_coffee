import type { OrderStatus } from "@/models/order.types";

const STYLES: Record<OrderStatus, { label: string; className: string }> = {
  pendiente: {
    label: "Pendiente",
    className: "bg-latte/25 text-espresso",
  },
  cobrado: {
    label: "Cobrado",
    className: "bg-green/15 text-green",
  },
  cancelado: {
    label: "Cancelado",
    className: "bg-terracotta/15 text-terracotta",
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STYLES[status] ?? STYLES.pendiente;
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
}

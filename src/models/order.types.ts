/* ============================================================
   MODEL · Tipos de pedidos (espejo de las tablas de Supabase)
   ============================================================ */

import type { OrderItemRow } from "./orderItem.map";

export type OrderStatus = "pendiente" | "cobrado" | "cancelado";
export type PaymentMethod = "efectivo" | "transferencia";

export interface OrderRow {
  id: string;
  customer_name: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  note: string | null;
  payment_method: PaymentMethod | null;
  created_by: string;
  created_at: string;
  paid_at: string | null;
  updated_at: string;
}

/** Pedido con sus líneas (para vistas de detalle). */
export interface OrderWithItems extends OrderRow {
  order_items: OrderItemRow[];
}

const TIME_FMT = new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Mexico_City",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

const DATETIME_FMT = new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Mexico_City",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

export function formatOrderTime(iso: string): string {
  return TIME_FMT.format(new Date(iso));
}

/** Instante UTC del inicio de HOY en zona México (UTC-6, sin horario de verano). */
export function startOfTodayMX(): string {
  const todayMX = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return new Date(`${todayMX}T00:00:00-06:00`).toISOString();
}

export function formatOrderDateTime(iso: string): string {
  return DATETIME_FMT.format(new Date(iso));
}

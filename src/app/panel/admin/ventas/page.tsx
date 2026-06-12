import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/models/menu.types";

type Periodo = "dia" | "semana" | "mes";

interface VentaRow {
  dia: string;
  total: number;
  cantidad: number;
  total_efectivo: number;
  total_transfer: number;
}

function todayMX(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function shiftMXDate(mxDateStr: string, days: number): string {
  const dt = new Date(`${mxDateStr}T00:00:00-06:00`);
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function rangeFor(periodo: Periodo): { desde: string; hasta: string } {
  const today = todayMX();
  if (periodo === "dia") return { desde: today, hasta: today };
  if (periodo === "mes") return { desde: `${today.slice(0, 7)}-01`, hasta: today };
  // semana: desde el lunes de esta semana
  const dow = new Date(`${today}T00:00:00-06:00`).getUTCDay(); // 0=dom..6=sáb
  const mondayOffset = (dow + 6) % 7;
  return { desde: shiftMXDate(today, -mondayOffset), hasta: today };
}

const TABS: { value: Periodo; label: string }[] = [
  { value: "dia", label: "Hoy" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mes" },
];

const DAY_FMT = new Intl.DateTimeFormat("es-MX", {
  timeZone: "America/Mexico_City",
  weekday: "short",
  day: "numeric",
  month: "short",
});

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo: raw } = await searchParams;
  const periodo: Periodo =
    raw === "semana" || raw === "mes" ? raw : "dia";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/panel/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/panel/mesera");

  const { desde, hasta } = rangeFor(periodo);
  const { data, error } = await supabase.rpc("ventas_resumen", { desde, hasta });
  const rows = ((data ?? []) as VentaRow[]).map((r) => ({
    dia: r.dia,
    total: Number(r.total),
    cantidad: Number(r.cantidad),
    efectivo: Number(r.total_efectivo),
    transfer: Number(r.total_transfer),
  }));

  const tot = rows.reduce(
    (a, r) => ({
      total: a.total + r.total,
      cantidad: a.cantidad + r.cantidad,
      efectivo: a.efectivo + r.efectivo,
      transfer: a.transfer + r.transfer,
    }),
    { total: 0, cantidad: 0, efectivo: 0, transfer: 0 }
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-16">
      <Link
        href="/panel/admin"
        className="pressable inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} weight="bold" />
        Volver al panel
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">Ventas</h1>

      {/* Periodo */}
      <div className="mt-4 inline-flex rounded-pill border border-[var(--line)] bg-cream-deep/30 p-1">
        {TABS.map((t) => {
          const active = t.value === periodo;
          return (
            <Link
              key={t.value}
              href={`/panel/admin/ventas?periodo=${t.value}`}
              className={`pressable rounded-pill px-4 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-green text-on-dark"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-6 text-sm font-medium text-terracotta">
          No se pudo cargar el reporte: {error.message}
        </p>
      ) : (
        <>
          {/* Total del periodo */}
          <div className="mt-5 rounded-card bg-bean px-5 py-5 text-on-dark">
            <p className="text-xs uppercase tracking-wide text-on-dark-dim">
              Total cobrado
            </p>
            <p className="mt-1 text-4xl font-bold tabular-nums">
              {formatMXN(tot.total)}
            </p>
            <p className="mt-1 text-sm text-on-dark-dim">
              {tot.cantidad} {tot.cantidad === 1 ? "pedido" : "pedidos"}
            </p>
          </div>

          {/* Desglose por método */}
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-card border border-[var(--line)] bg-cream px-4 py-3">
              <p className="text-xs text-ink-soft">Efectivo</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-ink">
                {formatMXN(tot.efectivo)}
              </p>
            </div>
            <div className="rounded-card border border-[var(--line)] bg-cream px-4 py-3">
              <p className="text-xs text-ink-soft">Transferencia</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-ink">
                {formatMXN(tot.transfer)}
              </p>
            </div>
          </div>

          {/* Desglose por día (semana / mes) */}
          {periodo !== "dia" && (
            <section className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                Por día
              </h2>
              {rows.length === 0 ? (
                <p className="mt-3 rounded-card border border-dashed border-[var(--line)] bg-cream-deep/30 px-4 py-8 text-center text-sm text-ink-soft">
                  Sin ventas en este periodo.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-card border border-[var(--line)] bg-cream">
                  {rows.map((r) => (
                    <li
                      key={r.dia}
                      className="flex items-center justify-between gap-3 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold capitalize text-ink">
                          {DAY_FMT.format(new Date(`${r.dia}T12:00:00-06:00`))}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {r.cantidad} {r.cantidad === 1 ? "pedido" : "pedidos"}
                        </p>
                      </div>
                      <span className="font-semibold tabular-nums text-ink">
                        {formatMXN(r.total)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {periodo === "dia" && rows.length === 0 && (
            <p className="mt-6 rounded-card border border-dashed border-[var(--line)] bg-cream-deep/30 px-4 py-8 text-center text-sm text-ink-soft">
              Aún no hay ventas cobradas hoy.
            </p>
          )}
        </>
      )}
    </main>
  );
}

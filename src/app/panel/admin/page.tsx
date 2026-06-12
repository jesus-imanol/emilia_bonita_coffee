import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ForkKnife,
  ChartLineUp,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/models/menu.types";
import { startOfTodayMX, type OrderWithItems } from "@/models/order.types";
import { SignOutButton } from "@/views/panel/SignOutButton";
import { SoundToggle } from "@/views/panel/SoundToggle";
import { AdminOrderCard } from "@/views/panel/AdminOrderCard";
import { OrdersRealtime } from "@/views/panel/OrdersRealtime";

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-[var(--line)] bg-cream px-4 py-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}

const NAV = [
  { href: "/panel/admin/carta", label: "Carta", icon: ForkKnife },
  { href: "/panel/admin/ventas", label: "Ventas", icon: ChartLineUp },
  { href: "/panel/admin/usuarios", label: "Meseros(as)", icon: UsersThree },
];

export default async function AdminHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/panel/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/panel/mesera");

  const startToday = startOfTodayMX();
  const [pendRes, cobradosRes] = await Promise.all([
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("status", "pendiente")
      .order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select("total")
      .eq("status", "cobrado")
      .gte("paid_at", startToday),
  ]);

  const pendientes = (pendRes.data ?? []) as OrderWithItems[];
  const cobrados = cobradosRes.data ?? [];
  const ventasHoy = cobrados.reduce((s, o) => s + (o.total ?? 0), 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 pb-16">
      <OrdersRealtime pendingIds={pendientes.map((o) => o.id)} />

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Panel
          </h1>
          <p className="mt-0.5 text-sm text-ink-soft">
            Hola, {profile.full_name || "admin"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <SignOutButton />
        </div>
      </header>

      {/* KPIs */}
      <div className="mt-5 grid max-w-2xl grid-cols-3 gap-3">
        <Kpi label="Pendientes" value={String(pendientes.length)} />
        <Kpi label="Cobrado hoy" value={formatMXN(ventasHoy)} />
        <Kpi label="Cobros hoy" value={String(cobrados.length)} />
      </div>

      {/* Navegación */}
      <nav className="mt-4 grid max-w-2xl grid-cols-3 gap-3">
        {NAV.map((n) => {
          const Icon = n.icon;
          return (
            <Link
              key={n.href}
              href={n.href}
              className="pressable flex flex-col items-center gap-1.5 rounded-card border border-[var(--line)] bg-cream-deep/30 px-3 py-4 text-sm font-semibold text-ink transition-colors hover:border-green/40"
            >
              <Icon size={22} weight="regular" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Tablero de pendientes (tiempo real) */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
            Pedidos pendientes
          </h2>
          <span className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-green" />
            En vivo
          </span>
        </div>

        {pendientes.length === 0 ? (
          <p className="mt-3 rounded-card border border-dashed border-[var(--line)] bg-cream-deep/30 px-4 py-10 text-center text-sm text-ink-soft">
            No hay pedidos pendientes. Entrarán aquí en cuanto una mesera los
            envíe.
          </p>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendientes.map((o) => (
              <AdminOrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

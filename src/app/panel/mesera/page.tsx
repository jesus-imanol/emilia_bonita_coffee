import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, ClockCountdown } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { formatMXN } from "@/models/menu.types";
import {
  formatOrderTime,
  startOfTodayMX,
  type OrderStatus,
} from "@/models/order.types";
import { SignOutButton } from "@/views/panel/SignOutButton";
import { StatusBadge } from "@/views/panel/StatusBadge";
import { WelcomeOverlay } from "@/views/panel/WelcomeOverlay";
import { WelcomeReplayButton } from "@/views/panel/WelcomeReplayButton";

// Bienvenida especial (una sola vez) para una mesera en particular.
const SPECIAL_EMAIL = "ortizodaliz13@gmail.com";
const SPECIAL_NAMES = ["odalis", "ortiz", "odalis ortiz", "oda"];

interface OrderListRow {
  id: string;
  customer_name: string;
  status: OrderStatus;
  total: number;
  created_at: string;
}

const COLS = "id, customer_name, status, total, created_at";

function todayLabel(): string {
  const s = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function OrderRow({ o }: { o: OrderListRow }) {
  return (
    <li>
      <Link
        href={`/panel/mesera/${o.id}`}
        className="pressable flex items-center justify-between gap-3 rounded-card border border-[var(--line)] bg-cream p-4 transition-colors hover:border-green/40"
      >
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{o.customer_name}</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {formatOrderTime(o.created_at)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="font-semibold tabular-nums text-ink">
            {formatMXN(o.total)}
          </span>
          <StatusBadge status={o.status} />
        </div>
      </Link>
    </li>
  );
}

export default async function MeseraHome({
  searchParams,
}: {
  searchParams: Promise<{ historial?: string }>;
}) {
  const { historial } = await searchParams;
  const showHistory = historial === "1";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/panel/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const email = (user.email ?? "").toLowerCase();
  const fname = (profile?.full_name ?? "").trim().toLowerCase();
  const isSpecialMesera =
    email === SPECIAL_EMAIL || SPECIAL_NAMES.includes(fname);

  const startToday = startOfTodayMX();

  const [pendRes, hoyRes] = await Promise.all([
    supabase
      .from("orders")
      .select(COLS)
      .eq("created_by", user.id)
      .eq("status", "pendiente")
      .order("created_at", { ascending: true }),
    supabase
      .from("orders")
      .select(COLS)
      .eq("created_by", user.id)
      .neq("status", "pendiente")
      .gte("created_at", startToday)
      .order("created_at", { ascending: false }),
  ]);

  const pendientes = (pendRes.data ?? []) as OrderListRow[];
  const hoy = (hoyRes.data ?? []) as OrderListRow[];

  let anteriores: OrderListRow[] = [];
  if (showHistory) {
    const { data } = await supabase
      .from("orders")
      .select(COLS)
      .eq("created_by", user.id)
      .neq("status", "pendiente")
      .lt("created_at", startToday)
      .order("created_at", { ascending: false })
      .limit(50);
    anteriores = (data ?? []) as OrderListRow[];
  }

  const cobradosHoy = hoy.filter((o) => o.status === "cobrado");
  const totalHoy = cobradosHoy.reduce((s, o) => s + o.total, 0);
  const dayEmpty = pendientes.length === 0 && hoy.length === 0;

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-28">
      {isSpecialMesera && <WelcomeOverlay userId={user.id} />}

      {/* Bienvenida */}
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0 overflow-hidden rounded-2xl border border-[var(--line)] bg-white p-1">
            <Image
              src="/imagen_decorativa_mesera/snoopy_monio.png"
              alt=""
              width={375}
              height={666}
              priority
              className="h-16 w-auto"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-soft">{todayLabel()}</p>
            <h1 className="text-xl font-bold tracking-tight text-ink">
              Hola, {profile?.full_name || "mesera"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSpecialMesera && <WelcomeReplayButton userId={user.id} />}
          <SignOutButton />
        </div>
      </header>

      {/* Resumen de hoy */}
      <div className="mt-5 flex items-center justify-between rounded-card border border-[var(--line)] bg-cream-deep/40 px-4 py-3">
        <div>
          <p className="text-xs text-ink-soft">Cobrado hoy</p>
          <p className="text-lg font-bold tabular-nums text-ink">
            {formatMXN(totalHoy)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink-soft">Pedidos cobrados</p>
          <p className="text-lg font-bold tabular-nums text-ink">
            {cobradosHoy.length}
          </p>
        </div>
      </div>

      {/* Pendientes (prioridad) */}
      {pendientes.length > 0 && (
        <section className="mt-7">
          <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-espresso">
            <ClockCountdown size={15} weight="bold" />
            Pendientes · {pendientes.length}
          </h2>
          <ul className="mt-3 space-y-2.5">
            {pendientes.map((o) => (
              <OrderRow key={o.id} o={o} />
            ))}
          </ul>
        </section>
      )}

      {/* Cobrados / cerrados hoy */}
      <section className="mt-7">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
          Hoy
        </h2>
        {hoy.length === 0 ? (
          <p className="mt-3 rounded-card border border-dashed border-[var(--line)] bg-cream-deep/30 px-4 py-8 text-center text-sm text-ink-soft">
            {dayEmpty
              ? "Buen día. Crea el primer pedido con el botón de abajo."
              : "Aún no cierras pedidos hoy."}
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {hoy.map((o) => (
              <OrderRow key={o.id} o={o} />
            ))}
          </ul>
        )}
      </section>

      {/* Días anteriores */}
      <section className="mt-7">
        {!showHistory ? (
          <Link
            href="/panel/mesera?historial=1"
            className="pressable block rounded-card border border-[var(--line)] px-4 py-3 text-center text-sm font-medium text-ink-soft transition-colors hover:border-green/40 hover:text-ink"
          >
            Ver pedidos de días anteriores
          </Link>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
                Anteriores
              </h2>
              <Link
                href="/panel/mesera"
                className="pressable text-xs font-semibold text-green"
              >
                Solo hoy
              </Link>
            </div>
            {anteriores.length === 0 ? (
              <p className="mt-3 rounded-card border border-dashed border-[var(--line)] bg-cream-deep/30 px-4 py-8 text-center text-sm text-ink-soft">
                No hay pedidos de días anteriores.
              </p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {anteriores.map((o) => (
                  <OrderRow key={o.id} o={o} />
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {/* Acción fija */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-cream/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <Link
          href="/panel/mesera/nuevo"
          className="pressable mx-auto flex max-w-md items-center justify-center gap-2 rounded-pill bg-green px-5 py-3 text-base font-semibold text-on-dark transition-colors hover:bg-bean"
        >
          <Plus size={18} weight="bold" />
          Nuevo pedido
        </Link>
      </div>
    </main>
  );
}

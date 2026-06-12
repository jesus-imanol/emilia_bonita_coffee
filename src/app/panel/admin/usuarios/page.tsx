import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { MeseraForm } from "@/views/panel/MeseraForm";

interface ProfileRow {
  id: string;
  full_name: string;
  role: string;
}

export default async function UsuariosPage() {
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

  const { data: meseras } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("role", "mesera")
    .order("full_name", { ascending: true });

  const list = (meseras ?? []) as ProfileRow[];

  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-16">
      <Link
        href="/panel/admin"
        className="pressable inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} weight="bold" />
        Volver al panel
      </Link>

      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
        Meseros(as)
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        Crea cuentas para que cada mesero(a) entre con su correo y contraseña.
      </p>

      <div className="mt-5">
        <MeseraForm />
      </div>

      <section className="mt-7">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
          Cuentas activas · {list.length}
        </h2>
        {list.length === 0 ? (
          <p className="mt-3 rounded-card border border-dashed border-[var(--line)] bg-cream-deep/30 px-4 py-8 text-center text-sm text-ink-soft">
            Todavía no hay cuentas. Crea la primera arriba.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--line)] overflow-hidden rounded-card border border-[var(--line)] bg-cream">
            {list.map((m) => (
              <li key={m.id} className="flex items-center gap-3 p-3.5">
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-green/15 text-sm font-bold text-green">
                  {(m.full_name || "?").charAt(0).toUpperCase()}
                </span>
                <span className="font-medium text-ink">
                  {m.full_name || "Sin nombre"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

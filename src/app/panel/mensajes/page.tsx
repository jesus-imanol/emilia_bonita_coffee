import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMessagesAdmin } from "@/models/special";
import { MessagesAdmin, type MessageRow } from "@/views/panel/MessagesAdmin";
import { PasswordChange } from "@/views/panel/PasswordChange";
import { SignOutButton } from "@/views/panel/SignOutButton";

export default async function MensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/panel/login");
  // Solo tu correo. Cualquier otro va a su panel normal.
  if (!isMessagesAdmin(user.email ?? null)) redirect("/panel");

  // Lectura con service-role: ves todos (incl. inactivos) sin ser admin.
  const admin = createAdminClient();
  const { data } = await admin
    .from("love_messages")
    .select("id, body, active")
    .order("sort_order", { ascending: true });

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-16">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Mensajes para ella 💌
          </h1>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-soft">
            Escribe varios. Cada día le aparece uno nuevo al entrar (van
            rotando), y ella puede repetirlo con el corazón. Esto solo lo ves tú.
          </p>
        </div>
        <SignOutButton />
      </header>

      <MessagesAdmin messages={(data ?? []) as MessageRow[]} />

      <PasswordChange />
    </main>
  );
}

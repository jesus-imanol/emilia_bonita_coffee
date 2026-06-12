"use client";

import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/panel/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="pressable inline-flex items-center gap-2 rounded-pill border border-[var(--line)] px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
    >
      <SignOut size={16} weight="bold" />
      Salir
    </button>
  );
}

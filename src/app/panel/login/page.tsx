"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }
    router.replace("/panel");
    router.refresh();
  }

  const inputClass =
    "mt-1 w-full rounded-input border border-[var(--line)] bg-cream px-3 py-2.5 text-ink outline-none transition-colors focus:border-green focus:ring-2 focus:ring-green/30";

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Image
            src="/logo-emilia-bonita-green.png"
            alt=""
            width={741}
            height={878}
            priority
            className="h-14 w-auto"
          />
          <h1 className="mt-4 text-xl font-semibold text-ink">
            Panel · Emilia Bonita
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Acceso para el personal.</p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-card border border-[var(--line)] bg-white/55 p-6"
        >
          <label className="block">
            <span className="text-sm font-medium text-ink">Correo</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink">Contraseña</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm font-medium text-terracotta">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="pressable w-full rounded-pill bg-green px-5 py-3 text-base font-semibold text-on-dark transition-colors hover:bg-bean disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}

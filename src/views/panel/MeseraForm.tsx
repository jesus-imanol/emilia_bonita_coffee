"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "@phosphor-icons/react";
import { createMesera } from "@/app/panel/actions";

export function MeseraForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okName, setOkName] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setOkName(null);
    try {
      await createMesera({ fullName, email, password });
      setOkName(fullName.trim());
      setFullName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "mt-1.5 w-full rounded-input border border-[var(--line)] bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-green focus:ring-1 focus:ring-green";

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-card border border-[var(--line)] bg-cream-deep/30 p-5"
    >
      <h2 className="text-sm font-bold text-ink">Nuevo(a) mesero(a)</h2>

      <div className="mt-4 space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Nombre
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="off"
            className={inputCls}
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Correo
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="off"
            className={inputCls}
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Contraseña
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="off"
            placeholder="Mínimo 6 caracteres"
            className={inputCls}
          />
          <span className="mt-1 block font-normal normal-case text-ink-soft/80">
            Compártesela a la mesera; la podrá cambiar después.
          </span>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-terracotta">
          {error}
        </p>
      )}
      {okName && (
        <p className="mt-3 text-sm font-medium text-green">
          Cuenta de {okName} creada. Ya puede entrar al panel.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="pressable mt-4 inline-flex items-center justify-center gap-2 rounded-pill bg-green px-5 py-2.5 text-sm font-semibold text-on-dark transition-colors hover:bg-bean disabled:opacity-50"
      >
        <UserPlus size={17} weight="bold" />
        {submitting ? "Creando…" : "Crear cuenta"}
      </button>
    </form>
  );
}

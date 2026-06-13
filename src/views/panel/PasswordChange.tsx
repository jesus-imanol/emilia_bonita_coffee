"use client";

import { useState } from "react";
import { Key } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export function PasswordChange() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (pw.length < 6) {
      setMsg({ ok: false, text: "Mínimo 6 caracteres." });
      return;
    }
    if (pw !== pw2) {
      setMsg({ ok: false, text: "Las contraseñas no coinciden." });
      return;
    }
    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setSaving(false);
    if (error) {
      setMsg({ ok: false, text: error.message });
    } else {
      setMsg({ ok: true, text: "Contraseña actualizada." });
      setPw("");
      setPw2("");
    }
  }

  const inputCls =
    "mt-1.5 w-full rounded-input border border-[var(--line)] bg-cream px-3.5 py-2.5 text-sm text-ink outline-none focus:border-green focus:ring-1 focus:ring-green";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 rounded-card border border-[var(--line)] bg-cream-deep/30 p-5"
    >
      <h2 className="flex items-center gap-1.5 text-sm font-bold text-ink">
        <Key size={15} weight="bold" />
        Cambiar mi contraseña
      </h2>

      <div className="mt-3 space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Nueva contraseña
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            className={inputCls}
          />
        </label>
        <label className="block text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Repite la contraseña
          <input
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            autoComplete="new-password"
            className={inputCls}
          />
        </label>
      </div>

      {msg && (
        <p
          role="alert"
          className={`mt-3 text-sm font-medium ${msg.ok ? "text-green" : "text-terracotta"}`}
        >
          {msg.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="pressable mt-4 inline-flex items-center justify-center rounded-pill bg-ink px-5 py-2.5 text-sm font-semibold text-on-dark transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Guardando…" : "Actualizar contraseña"}
      </button>
    </form>
  );
}

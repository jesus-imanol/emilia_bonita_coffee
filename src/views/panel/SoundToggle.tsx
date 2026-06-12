"use client";

import { Bell, BellSlash } from "@phosphor-icons/react";
import { useSound } from "@/viewmodels/useSound";

export function SoundToggle() {
  const enabled = useSound((s) => s.enabled);
  const toggle = useSound((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      title={enabled ? "Silenciar campana" : "Activar campana"}
      className={`pressable inline-flex h-9 w-9 items-center justify-center rounded-pill border transition-colors ${
        enabled
          ? "border-[var(--line)] text-ink-soft hover:text-ink"
          : "border-terracotta/30 bg-terracotta/10 text-terracotta"
      }`}
    >
      {enabled ? (
        <Bell size={17} weight="bold" />
      ) : (
        <BellSlash size={17} weight="bold" />
      )}
      <span className="sr-only">
        {enabled ? "Sonido activado" : "Sonido silenciado"}
      </span>
    </button>
  );
}

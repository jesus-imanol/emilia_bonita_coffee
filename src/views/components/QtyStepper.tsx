"use client";

import { Minus, Plus } from "@phosphor-icons/react";

interface QtyStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  size?: "sm" | "md";
  ariaLabel?: string;
}

export function QtyStepper({
  value,
  onChange,
  min = 1,
  size = "md",
  ariaLabel = "Cantidad",
}: QtyStepperProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const num = size === "sm" ? "w-7 text-sm" : "w-9 text-base";

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center rounded-pill border border-[var(--line)] bg-cream"
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label="Quitar uno"
        className={`pressable inline-flex ${dim} items-center justify-center rounded-pill text-bean disabled:opacity-35`}
      >
        <Minus size={16} weight="bold" />
      </button>
      <span
        aria-live="polite"
        className={`text-center font-display font-semibold tabular-nums text-ink ${num}`}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label="Agregar uno"
        className={`pressable inline-flex ${dim} items-center justify-center rounded-pill text-bean`}
      >
        <Plus size={16} weight="bold" />
      </button>
    </div>
  );
}

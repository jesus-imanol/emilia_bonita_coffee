"use client";

import { Printer } from "@phosphor-icons/react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="pressable inline-flex shrink-0 items-center gap-2 rounded-pill bg-green px-5 py-2.5 text-sm font-semibold text-on-dark transition-colors hover:bg-bean"
    >
      <Printer size={18} weight="bold" />
      Imprimir / Guardar PDF
    </button>
  );
}

"use client";

import { useState } from "react";
import { Money } from "@phosphor-icons/react";
import { PaymentDialog } from "./PaymentDialog";

export function CobrarButton({
  orderId,
  customerName,
  total,
}: {
  orderId: string;
  customerName: string;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pressable inline-flex flex-1 items-center justify-center gap-2 rounded-pill bg-green px-5 py-3 text-base font-semibold text-on-dark transition-colors hover:bg-bean"
      >
        <Money size={18} weight="bold" />
        Cobrar
      </button>
      <PaymentDialog
        open={open}
        onClose={() => setOpen(false)}
        orderId={orderId}
        customerName={customerName}
        total={total}
      />
    </>
  );
}

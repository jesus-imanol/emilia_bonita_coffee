"use client";

import { ModalShell } from "@/views/components/ModalShell";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Volver",
  danger = false,
  loading = false,
  error,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      label={title}
      align="bottom"
      zIndex="var(--z-sheet)"
    >
      <div className="px-5 py-6">
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        {message && (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            {message}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-terracotta">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-3 border-t border-[var(--line)] px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="pressable flex-1 rounded-pill border border-[var(--line)] px-5 py-3 text-base font-semibold text-ink transition-colors hover:bg-cream-deep/40 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`pressable flex-1 rounded-pill px-5 py-3 text-base font-semibold text-on-dark transition-colors disabled:opacity-50 ${
            danger ? "bg-terracotta hover:opacity-90" : "bg-green hover:bg-bean"
          }`}
        >
          {loading ? "…" : confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

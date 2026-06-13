"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash, Heart } from "@phosphor-icons/react";
import {
  createMessage,
  deleteMessage,
  setMessageActive,
  updateMessage,
} from "@/app/panel/actions";

export interface MessageRow {
  id: string;
  body: string;
  active: boolean;
}

export function MessagesAdmin({ messages }: { messages: MessageRow[] }) {
  return (
    <div className="mt-6 space-y-6">
      <AddMessage />

      {messages.length === 0 ? (
        <p className="rounded-card border border-dashed border-[var(--line)] bg-cream-deep/30 px-4 py-8 text-center text-sm text-ink-soft">
          Aún no hay mensajes. Escribe el primero arriba 💕
        </p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <MessageRowEditor key={m.id} message={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

function AddMessage() {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createMessage(body);
      setBody("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-card border border-terracotta/25 bg-terracotta/5 p-4"
    >
      <label
        htmlFor="new-message"
        className="flex items-center gap-1.5 text-sm font-bold text-ink"
      >
        <Heart size={15} weight="fill" className="text-terracotta" />
        Nuevo mensaje
      </label>
      <textarea
        id="new-message"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="Ej. Buenos días, mi amor. Hoy te ves preciosa 💖"
        className="mt-2 w-full resize-none rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
      />
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-terracotta">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={saving || !body.trim()}
        className="pressable mt-3 inline-flex items-center gap-2 rounded-pill bg-terracotta px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Plus size={15} weight="bold" />
        {saving ? "Guardando…" : "Agregar mensaje"}
      </button>
    </form>
  );
}

function MessageRowEditor({ message }: { message: MessageRow }) {
  const router = useRouter();
  const [body, setBody] = useState(message.body);
  const [active, setActive] = useState(message.active);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = body !== message.body;

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      await updateMessage(message.id, body);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  async function onToggle(next: boolean) {
    setActive(next);
    try {
      await setMessageActive(message.id, next);
      router.refresh();
    } catch {
      setActive(!next);
    }
  }

  async function onDelete() {
    setDeleting(true);
    try {
      await deleteMessage(message.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo borrar.");
      setDeleting(false);
    }
  }

  return (
    <li className="rounded-card border border-[var(--line)] bg-cream p-3">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        aria-label="Mensaje"
        className="w-full resize-none rounded-input border border-[var(--line)] bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta"
      />

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-terracotta">
          {error}
        </p>
      )}

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => onToggle(e.target.checked)}
            className="h-4 w-4 accent-[var(--terracotta)]"
          />
          Activo
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
            className="pressable rounded-pill bg-ink px-4 py-1.5 text-sm font-semibold text-on-dark transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>

          {confirmDel ? (
            <span className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="pressable rounded-pill bg-terracotta px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {deleting ? "…" : "Borrar"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDel(false)}
                className="pressable rounded-pill px-2 py-1.5 text-xs font-medium text-ink-soft"
              >
                No
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDel(true)}
              aria-label="Borrar mensaje"
              className="pressable inline-flex h-8 w-8 items-center justify-center rounded-pill text-terracotta transition-colors hover:bg-terracotta/10"
            >
              <Trash size={15} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

"use client";

type Snapshot = "show" | "hide";

export interface WelcomeStore {
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => Snapshot;
  getServerSnapshot: () => Snapshot;
  /** Reabre el mensaje manualmente (con el botón de corazón). */
  open: () => void;
  /** Cierra y marca como visto HOY (no vuelve a salir solo hasta mañana). */
  dismiss: () => void;
}

// Una instancia por usuario+día, compartida entre el overlay y el botón.
const cache = new Map<string, WelcomeStore>();

/**
 * Muestra la bienvenida una vez al día (compara `dateKey` con lo guardado).
 * Cada día nuevo vuelve a salir sola; el corazón la reabre cuando quiera.
 */
export function getWelcomeStore(userId: string, dateKey: string): WelcomeStore {
  const cacheKey = `${userId}:${dateKey}`;
  const existing = cache.get(cacheKey);
  if (existing) return existing;

  const seenKey = `eb-welcome-date-${userId}`;
  const listeners = new Set<() => void>();
  let manualOpen = false;
  const notify = () => listeners.forEach((l) => l());

  const store: WelcomeStore = {
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot() {
      if (manualOpen) return "show";
      try {
        return localStorage.getItem(seenKey) === dateKey ? "hide" : "show";
      } catch {
        return "hide";
      }
    },
    getServerSnapshot() {
      return "hide";
    },
    open() {
      manualOpen = true;
      notify();
    },
    dismiss() {
      try {
        localStorage.setItem(seenKey, dateKey);
      } catch {
        /* noop */
      }
      manualOpen = false;
      notify();
    },
  };

  cache.set(cacheKey, store);
  return store;
}

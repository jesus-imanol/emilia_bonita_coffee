"use client";

type Snapshot = "show" | "hide";

export interface WelcomeStore {
  subscribe: (cb: () => void) => () => void;
  getSnapshot: () => Snapshot;
  getServerSnapshot: () => Snapshot;
  /** Reabre el mensaje manualmente (aunque ya se haya visto). */
  open: () => void;
  /** Cierra y marca como visto (no vuelve a salir solo). */
  dismiss: () => void;
}

// Una instancia por usuario, compartida entre el overlay y el botón de repetir.
const cache = new Map<string, WelcomeStore>();

export function getWelcomeStore(userId: string): WelcomeStore {
  const key = `eb-welcome-${userId}`;
  const existing = cache.get(key);
  if (existing) return existing;

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
        return localStorage.getItem(key) ? "hide" : "show";
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
        localStorage.setItem(key, "1");
      } catch {
        /* noop */
      }
      manualOpen = false;
      notify();
    },
  };

  cache.set(key, store);
  return store;
}

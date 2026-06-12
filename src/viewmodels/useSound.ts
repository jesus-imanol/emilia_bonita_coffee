"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SoundState {
  enabled: boolean;
  _hasHydrated: boolean;
  toggle: () => void;
  setHasHydrated: (v: boolean) => void;
}

/**
 * VIEWMODEL · Preferencia de sonido del panel (campana de pedido nuevo).
 * Persistida en localStorage para que sobreviva recargas.
 */
export const useSound = create<SoundState>()(
  persist(
    (set) => ({
      enabled: true,
      _hasHydrated: false,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "emilia-panel-sound",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ enabled: s.enabled }),
      onRehydrateStorage: () => (s) => s?.setHasHydrated(true),
    }
  )
);

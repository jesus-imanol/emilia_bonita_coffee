"use client";

import { create } from "zustand";

interface OrderToastState {
  message: string | null;
  /** Cambia con cada aviso para reiniciar el temporizador aunque el texto repita. */
  seq: number;
  notify: (message: string) => void;
  clear: () => void;
}

/** VIEWMODEL · Aviso breve "agregado al pedido" para la mesera. */
export const useOrderToast = create<OrderToastState>((set) => ({
  message: null,
  seq: 0,
  notify: (message) => set((s) => ({ message, seq: s.seq + 1 })),
  clear: () => set({ message: null }),
}));

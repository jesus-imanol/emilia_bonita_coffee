"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSound } from "@/viewmodels/useSound";

/**
 * VIEW · Mantiene el tablero del admin al día con varias redes de seguridad,
 * para que NUNCA se quede trabado (aunque el realtime se caiga):
 *
 *  1. Realtime (postgres_changes) → refresco instantáneo.
 *  2. setAuth en cada refresh de token → el socket no se queda con un JWT viejo.
 *  3. Polling cada 15s + refresco al volver a la pestaña → respaldo si el
 *     socket se cae en silencio.
 *
 * La campana NO depende del evento de realtime: suena cuando aparece un
 * `pendingId` nuevo (venga del realtime o del polling), así que también
 * timbra si el tiempo real estuviera caído.
 */
export function OrdersRealtime({ pendingIds }: { pendingIds: string[] }) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seenRef = useRef<Set<string> | null>(null);

  // --- Infraestructura (se monta una sola vez) ---
  useEffect(() => {
    const supabase = createClient();
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const audio = new Audio("/nuevo_pedido/campana-wilo.mp3");
    audio.preload = "auto";
    audioRef.current = audio;

    // Desbloquea el audio en la primera interacción (política de autoplay).
    const unlock = () => {
      audio.muted = true;
      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
        })
        .catch(() => {
          audio.muted = false;
        });
    };
    window.addEventListener("pointerdown", unlock, { once: true });

    const refresh = () => {
      if (refreshTimer) return; // coalesce ráfagas
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        router.refresh();
      }, 300);
    };

    const channel = supabase
      .channel("panel-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        refresh
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_items" },
        refresh
      )
      .subscribe();

    // (2) Propaga el token nuevo al socket de realtime cuando se refresca.
    const { data: authSub } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) {
          supabase.realtime.setAuth(session.access_token);
        }
      }
    );

    // (3a) Respaldo: refresco periódico por si el socket se cae en silencio.
    const poll = setInterval(() => router.refresh(), 15000);

    // (3b) Al volver a la pestaña/despertar el equipo, re-sincroniza.
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      clearInterval(poll);
      window.removeEventListener("pointerdown", unlock);
      document.removeEventListener("visibilitychange", onVisible);
      authSub.subscription.unsubscribe();
      supabase.removeChannel(channel);
      audioRef.current = null;
    };
  }, [router]);

  // --- Campana: suena cuando aparece un pedido nuevo (id no visto antes) ---
  const idsKey = pendingIds.join(",");
  useEffect(() => {
    // Primera carga: registra lo que ya había sin timbrar.
    if (seenRef.current === null) {
      seenRef.current = new Set(pendingIds);
      return;
    }
    let hasNew = false;
    for (const id of pendingIds) {
      if (!seenRef.current.has(id)) {
        hasNew = true;
        seenRef.current.add(id);
      }
    }
    if (hasNew && useSound.getState().enabled) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {
          /* sin interacción todavía: se ignora */
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  return null;
}

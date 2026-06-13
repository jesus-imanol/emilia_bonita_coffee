"use client";

import { Heart } from "@phosphor-icons/react";
import { getWelcomeStore } from "@/viewmodels/welcomeStore";

/** Botón (solo para la mesera del mensaje) que reabre el mensaje del día. */
export function WelcomeReplayButton({
  userId,
  dateKey,
}: {
  userId: string;
  dateKey: string;
}) {
  const store = getWelcomeStore(userId, dateKey);
  return (
    <button
      type="button"
      onClick={() => store.open()}
      aria-label="Ver mi mensaje"
      title="Tu mensaje 💖"
      className="pressable inline-flex h-9 w-9 items-center justify-center rounded-pill border border-terracotta/30 bg-terracotta/10 text-terracotta transition-colors hover:bg-terracotta/20"
    >
      <Heart size={17} weight="fill" />
    </button>
  );
}

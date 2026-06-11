import Image from "next/image";
import { BUSINESS } from "@/models/business.data";

/**
 * VIEW · Logo de Emilia Bonita (emblema de linea).
 *
 * Dos variantes de color, ambas con fondo transparente:
 *   - tone "light" -> emblema crema (para fondos verdes: hero, footer)
 *   - tone "dark"  -> emblema verde (para fondos claros: nav solida)
 *
 * Generadas desde public/logo_maria_bonita.jpeg con make-logo (sharp).
 */

type Variant = "hero" | "nav" | "footer";
type Tone = "light" | "dark";

interface LogoSlotProps {
  variant?: Variant;
  /** "light" = emblema claro sobre fondo oscuro · "dark" = emblema verde sobre fondo claro. */
  tone?: Tone;
  showWordmark?: boolean;
  className?: string;
}

const MARK_SIZE: Record<Variant, string> = {
  hero: "h-24 w-auto sm:h-28",
  nav: "h-9 w-auto",
  footer: "h-12 w-auto",
};

const WORDMARK_SIZE: Record<Variant, string> = {
  hero: "text-2xl",
  nav: "text-lg",
  footer: "text-xl",
};

export function LogoSlot({
  variant = "nav",
  tone = "light",
  showWordmark = true,
  className = "",
}: LogoSlotProps) {
  const src =
    tone === "light"
      ? "/logo-emilia-bonita.png"
      : "/logo-emilia-bonita-green.png";
  const wordColor = tone === "light" ? "text-on-dark" : "text-bean";

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <Image
        src={src}
        // Si va el wordmark al lado, la imagen es decorativa (alt vacio).
        alt={showWordmark ? "" : BUSINESS.name}
        width={741}
        height={878}
        priority={variant === "hero"}
        className={MARK_SIZE[variant]}
      />
      {showWordmark && (
        <span
          className={`font-display font-semibold tracking-tight ${WORDMARK_SIZE[variant]} ${wordColor}`}
        >
          {BUSINESS.name}
        </span>
      )}
    </span>
  );
}

"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowDown, InstagramLogo } from "@phosphor-icons/react";
import { BUSINESS } from "@/models/business.data";
import { LogoSlot } from "@/views/components/LogoSlot";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Hero() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.09,
        delayChildren: reduce ? 0 : 0.06,
      },
    },
  };

  const rise: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
        show: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.6, ease: EASE },
        },
      };

  const photoReveal: Variants = reduce
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }
    : {
        hidden: { opacity: 0, clipPath: "inset(0 0 100% 0 round 22px)" },
        show: {
          opacity: 1,
          clipPath: "inset(0 0 0% 0 round 22px)",
          transition: { duration: 0.9, ease: EASE },
        },
      };

  return (
    <section
      id="inicio"
      className="anchor relative isolate overflow-hidden bg-green-deep text-on-green"
    >
      {/* Profundidad sutil (no glow de IA): un aclarado radial muy tenue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 18% 8%, rgba(92,126,99,0.28), transparent 55%)",
        }}
      />

      <div className="mx-auto grid min-h-[100dvh] max-w-6xl grid-cols-1 items-center gap-12 px-4 pb-16 pt-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-20">
        {/* Columna de contenido */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start"
        >
          <motion.div variants={rise}>
            <LogoSlot variant="hero" tone="light" showWordmark={false} />
          </motion.div>

          <h1 className="mt-8 font-display text-[clamp(3rem,9vw,5.75rem)] font-bold leading-[0.95] tracking-[-0.03em]">
            <motion.span variants={rise} className="block">
              Emilia
            </motion.span>
            <motion.span variants={rise} className="block text-latte">
              Bonita
            </motion.span>
          </h1>

          <motion.p
            variants={rise}
            className="mt-6 max-w-md text-lg leading-relaxed text-on-green-dim"
          >
            {BUSINESS.tagline}
          </motion.p>

          <motion.div variants={rise} className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#menu"
              className="pressable lift inline-flex items-center gap-2 rounded-pill bg-cream px-6 py-3.5 text-base font-semibold text-green-deep hover:bg-white"
            >
              Ver la carta
              <ArrowDown size={18} weight="bold" />
            </a>
            <a
              href={BUSINESS.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pressable inline-flex items-center gap-2 rounded-pill border border-on-green/40 px-6 py-3.5 text-base font-semibold text-on-green transition-colors hover:bg-on-green/10"
            >
              <InstagramLogo size={18} weight="bold" />
              Instagram
            </a>
          </motion.div>
        </motion.div>

        {/* Columna de foto (solo desktop, para que el hero no desborde en móvil) */}
        <motion.div
          variants={photoReveal}
          initial="hidden"
          animate="show"
          className="relative hidden lg:block"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-img">
            {/* TODO: reemplazar por foto real del café (grano de café, bebidas, el local). */}
            <Image
              src="https://picsum.photos/seed/emilia-bonita-cafe/1100/1375"
              alt="Bebidas y antojos recién preparados en Emilia Bonita"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
            {/* Duotono verde para que cualquier foto entre en marca */}
            <div className="absolute inset-0 bg-green-deep/45 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-green-deep/75 via-transparent to-green-deep/15" />
          </div>

          {/* Nota manuscrita tipo libreta */}
          <span className="hand absolute -bottom-3 left-6 -rotate-6 text-3xl text-cream drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
            recién hecho
          </span>
        </motion.div>
      </div>
    </section>
  );
}

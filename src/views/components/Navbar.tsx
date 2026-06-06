"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { InstagramLogo, List, X } from "@phosphor-icons/react";
import { BUSINESS } from "@/models/business.data";
import { useScrollSpy } from "@/viewmodels/useScrollSpy";

const NAV_IDS = BUSINESS.nav.map((n) => n.id);

export function Navbar() {
  const reduce = useReducedMotion();
  const active = useScrollSpy(NAV_IDS, { rootMargin: "-45% 0px -50% 0px" });
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  // Navbar transparente sobre el hero verde; se vuelve sólida (crema) al bajar.
  useEffect(() => {
    const hero = document.getElementById("inicio");
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setSolid(entry.intersectionRatio < 0.6),
      { threshold: [0, 0.6, 1] }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  const shell = solid
    ? "bg-cream/85 supports-[backdrop-filter]:bg-cream/70 backdrop-blur-md border-[var(--line)] text-green-deep"
    : "bg-transparent border-transparent text-on-green";

  const igClass = solid
    ? "bg-green text-on-green"
    : "border border-on-green/40 text-on-green";

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      style={{ zIndex: "var(--z-nav)" }}
    >
      <nav
        aria-label="Principal"
        className={`mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 border-b px-4 transition-colors duration-300 sm:h-[68px] sm:px-6 ${shell}`}
        style={{ transitionTimingFunction: "var(--ease-out)" }}
      >
        {/* Marca */}
        <a
          href="#inicio"
          className="pressable -ml-1 inline-flex items-center rounded-pill px-1 py-1"
          aria-label={`${BUSINESS.name}, ir al inicio`}
        >
          <span className="inline-flex items-center gap-2.5">
            <Image
              src={solid ? "/logo-emilia-bonita-green.png" : "/logo-emilia-bonita.png"}
              alt=""
              width={741}
              height={878}
              priority
              className="h-8 w-auto"
            />
            <span className="font-display text-lg font-semibold tracking-tight">
              {BUSINESS.name}
            </span>
          </span>
        </a>

        {/* Enlaces (desktop) */}
        <ul className="hidden items-center gap-1 lg:flex">
          {BUSINESS.nav.map((link) => {
            const isActive = active === link.id;
            return (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative inline-block rounded-pill px-3.5 py-2 text-sm transition-opacity ${
                    isActive ? "font-semibold" : "font-medium opacity-70 hover:opacity-100"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId={reduce ? undefined : "nav-underline"}
                      className="absolute inset-x-3.5 -bottom-0.5 h-[2px] rounded-full bg-current"
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Instagram + menú móvil */}
        <div className="flex items-center gap-2">
          <a
            href={BUSINESS.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`pressable hidden items-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold sm:inline-flex ${igClass}`}
          >
            <InstagramLogo size={18} weight="bold" />
            Instagram
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="pressable inline-flex h-10 w-10 items-center justify-center rounded-pill lg:hidden"
          >
            {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
          </button>
        </div>
      </nav>

      {/* Panel móvil */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-movil"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mx-3 mt-2 overflow-hidden rounded-card bg-cream shadow-[var(--shadow-lift)] lg:hidden"
          >
            <ul className="flex flex-col p-2">
              {BUSINESS.nav.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    onClick={() => setOpen(false)}
                    className={`pressable block rounded-input px-4 py-3 text-base text-green-deep ${
                      active === link.id ? "bg-green/10 font-semibold" : "font-medium"
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="p-1">
                <a
                  href={BUSINESS.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="pressable flex items-center justify-center gap-2 rounded-pill bg-green px-4 py-3 text-base font-semibold text-on-green"
                >
                  <InstagramLogo size={20} weight="bold" />
                  {BUSINESS.instagram.handle}
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

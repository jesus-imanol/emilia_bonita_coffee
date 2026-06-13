"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

/**
 * Barra de progreso superior durante la navegación. Aparece al tocar un
 * enlace interno y se va sola al cargar la página (se reinicia con la ruta).
 * Feedback de "está cargando" para no re-clicar; respeta navegaciones rápidas
 * con un pequeño retraso para no parpadear.
 */
function Bar() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("/")) return; // solo navegación interna
      if (a.getAttribute("target") === "_blank") return;
      if (href === window.location.pathname + window.location.search) return;
      setActive(true);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (!active) return null;

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[200] h-[3px] origin-left rounded-r-full bg-green"
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: 0.92 }}
      transition={{ duration: 1.4, ease: "easeOut", delay: 0.12 }}
    />
  );
}

export function NavProgress() {
  // Al cambiar la ruta, `key` remonta la barra y la reinicia (se oculta).
  const pathname = usePathname();
  return <Bar key={pathname} />;
}

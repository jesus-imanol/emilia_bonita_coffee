import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import "@/styles/print.css";
import { PrintMenu } from "@/views/print/PrintMenu";
import { PrintButton } from "@/views/print/PrintButton";

export const metadata: Metadata = {
  title: "Carta para imprimir",
  description:
    "Carta de Emilia Bonita en tamaño carta, lista para guardar como PDF e imprimir.",
  robots: { index: false, follow: false },
};

export default function CartaImprimiblePage() {
  return (
    <div className="carta-stage min-h-dvh bg-espresso px-4 py-8 sm:py-10">
      {/* Controles (no se imprimen) */}
      <div className="no-print mx-auto mb-6 flex max-w-[8.5in] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/"
            className="pressable inline-flex items-center gap-1.5 text-sm font-medium text-on-dark-dim transition-colors hover:text-cream"
          >
            <ArrowLeft size={16} weight="bold" />
            Volver al sitio
          </Link>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-on-dark-dim">
            Carta lista para imprimir. Abre Imprimir (Ctrl/Cmd + P), elige tamaño{" "}
            <b className="text-cream">Carta</b> y destino{" "}
            <b className="text-cream">Guardar como PDF</b>. Activa los gráficos
            de fondo si tu navegador lo pide, para conservar los colores.
          </p>
        </div>
        <PrintButton />
      </div>

      {/* Hoja tamaño carta (con scroll horizontal en pantallas chicas) */}
      <div className="mx-auto w-fit max-w-full overflow-x-auto">
        <PrintMenu />
      </div>
    </div>
  );
}

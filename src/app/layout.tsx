import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Caveat } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import { Navbar } from "@/views/components/Navbar";
import { GrainOverlay } from "@/views/components/GrainOverlay";
import { BUSINESS } from "@/models/business.data";

// Par tipográfico: display humanista cálido (Bricolage), cuerpo legible
// (Hanken) y una manuscrita (Caveat) para notas puntuales tipo libreta.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

const DESCRIPTION =
  "Café de origen y antojos hechos a mano en Huixtla, Chiapas. Hamburguesas, hot dogs, crepas, frappes, postres y bebidas, servidos con cariño.";

export const metadata: Metadata = {
  // TODO: reemplazar por el dominio definitivo cuando se despliegue.
  metadataBase: new URL("https://emilia-bonita.vercel.app"),
  title: {
    default: "Emilia Bonita · Cafetería en Huixtla, Chiapas",
    template: "%s · Emilia Bonita",
  },
  description: DESCRIPTION,
  applicationName: BUSINESS.name,
  keywords: [
    "cafetería",
    "Huixtla",
    "Chiapas",
    "café",
    "frappes",
    "crepas",
    "hamburguesas",
    "Emilia Bonita",
  ],
  authors: [{ name: BUSINESS.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "/",
    siteName: BUSINESS.name,
    title: "Emilia Bonita · Cafetería en Huixtla, Chiapas",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Emilia Bonita · Cafetería en Huixtla, Chiapas",
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1e382a",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${hanken.variable} ${caveat.variable}`}
    >
      <body className="min-h-dvh">
        {/* Sin JS: los reveals de Motion quedan en opacity:0. Este fallback
            garantiza que todo el contenido sea visible si JS está deshabilitado. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;filter:none!important;transform:none!important}`}</style>
        </noscript>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-pill focus:bg-green focus:px-4 focus:py-2 focus:font-semibold focus:text-on-green"
        >
          Saltar al contenido
        </a>
        <GrainOverlay />
        <Navbar />
        <main id="contenido">{children}</main>
      </body>
    </html>
  );
}

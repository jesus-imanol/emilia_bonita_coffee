import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panel · Emilia Bonita",
  robots: { index: false, follow: false },
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Shell sobrio del panel (sin chrome de marketing). Una sola sans vía .panel-root.
  return <div className="panel-root min-h-dvh bg-cream text-ink">{children}</div>;
}

import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const alt = "Emilia Bonita, cafetería en Huixtla, Chiapas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// El emblema crema, embebido como data URL para que Satori lo pinte.
const logoSrc = `data:image/png;base64,${readFileSync(
  join(process.cwd(), "public/logo-emilia-bonita.png")
).toString("base64")}`;

// Imagen Open Graph generada en marca (café espresso + crema).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#241712",
          color: "#efe6d6",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={101} height={120} alt="" />
          <div style={{ fontSize: 30, color: "#c8b6a0" }}>Huixtla, Chiapas</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>
            Emilia
          </div>
          <div
            style={{
              fontSize: 132,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: -4,
              color: "#c9a77c",
            }}
          >
            Bonita
          </div>
        </div>

        <div style={{ fontSize: 34, color: "#c8b6a0", maxWidth: 920 }}>
          Café de origen y antojos hechos a mano.
        </div>
      </div>
    ),
    { ...size }
  );
}

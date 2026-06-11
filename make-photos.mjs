import sharp from "sharp";
import { mkdirSync } from "node:fs";

mkdirSync("public/fotos", { recursive: true });

// Edicion ligera y cohesiva: auto-orientacion (EXIF), redimension para web,
// brillo/saturacion suaves y un leve enfoque. Nada agresivo: las fotos son reales.
const jobs = [
  {
    in: "public/frappes/frappe_001.jpeg",
    out: "public/fotos/frappes.jpg",
    brightness: 1.03,
    saturation: 1.06,
  },
  {
    in: "public/crepas/crepa_durazno.jpeg",
    out: "public/fotos/crepa.jpg",
    brightness: 1.09,
    saturation: 1.06,
  },
  {
    in: "public/frappes/frappe_crepa.jpeg",
    out: "public/fotos/frappe-crepa.jpg",
    brightness: 1.05,
    saturation: 1.05,
  },
  // Fotos para la galería de antojos (atajos a la carta).
  {
    in: "public/hamburguesas/hamburguesa_papas.jpeg",
    out: "public/fotos/hamburguesa.jpg",
    brightness: 1.04,
    saturation: 1.06,
  },
  {
    in: "public/frappes/hotdog_frape_oreo.jpeg",
    out: "public/fotos/hotdog.jpg",
    brightness: 1.05,
    saturation: 1.05,
  },
  {
    in: "public/frappes/frappe_002.jpeg",
    out: "public/fotos/frappe.jpg",
    brightness: 1.04,
    saturation: 1.06,
  },
  {
    in: "public/frapucchino/frapucchino.jpeg",
    out: "public/fotos/cafe.jpg",
    brightness: 1.05,
    saturation: 1.05,
  },
  // Fotos del local (fachada + mural representativo).
  {
    in: "public/fachada_angulo_45_grados_calle.jpeg",
    out: "public/fotos/fachada.jpg",
    brightness: 1.1,
    saturation: 1.05,
  },
  {
    in: "public/pared_representativa_emilia.jpeg",
    out: "public/fotos/mural.jpg",
    brightness: 1.05,
    saturation: 1.06,
  },
  {
    in: "public/pared_representativa_emilia_2.jpeg",
    out: "public/fotos/mural-2.jpg",
    brightness: 1.05,
    saturation: 1.06,
  },
];

for (const j of jobs) {
  const info = await sharp(j.in)
    .rotate()
    .resize({ width: 1000, withoutEnlargement: true })
    .modulate({ brightness: j.brightness, saturation: j.saturation })
    .linear(1.04, -4)
    .sharpen({ sigma: 0.6 })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(j.out);
  console.log(j.out, "->", info.width, "x", info.height, `(${Math.round(info.size / 1024)} KB)`);
}

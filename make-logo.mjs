import sharp from "sharp";

const input = "public/logo_maria_bonita.jpeg";
const meta = await sharp(input).metadata();

// Alpha desde la luminancia (lineas claras opacas, fondo verde transparente),
// con contraste para limpiar el fondo.
const LO = 80;
const HI = 185;
const m = 255 / (HI - LO);
const c = -m * LO;
const mask = await sharp(input).greyscale().linear(m, c).png().toBuffer();

// Pinta TODOS los pixeles opacos de un color solido y usa la mascara como alpha.
async function tint(hex, outfile) {
  const composed = await sharp({
    create: { width: meta.width, height: meta.height, channels: 3, background: hex },
  })
    .joinChannel(mask)
    .png()
    .toBuffer();
  await sharp(composed).trim().png().toFile(outfile);
  const o = await sharp(outfile).metadata();
  console.log(outfile, "->", o.width, "x", o.height);
}

// Crema (para fondos verdes: hero, footer, nav sobre el hero)
await tint("#f4efe3", "public/logo-emilia-bonita.png");
// Verde (para fondos claros: nav solida sobre crema)
await tint("#1e382a", "public/logo-emilia-bonita-green.png");

// Favicon: emblema crema centrado sobre cuadro verde con esquinas redondeadas.
const SIZE = 256;
const PAD = 30;
const emblem = await sharp("public/logo-emilia-bonita.png")
  .resize(SIZE - 2 * PAD, SIZE - 2 * PAD, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .toBuffer();
const rounded = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" rx="56" ry="56"/></svg>`
);
await sharp({
  create: { width: SIZE, height: SIZE, channels: 4, background: { r: 30, g: 56, b: 42, alpha: 1 } },
})
  .composite([
    { input: emblem, gravity: "center" },
    { input: rounded, blend: "dest-in" },
  ])
  .png()
  .toFile("src/app/icon.png");
console.log("src/app/icon.png -> 256 x 256");

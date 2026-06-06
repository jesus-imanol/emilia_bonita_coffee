# Emilia Bonita

Landing page de una sola página para la cafetería **Emilia Bonita**, en Huixtla, Chiapas, México. Café de origen y antojos hechos a mano: una pieza cálida, artesanal y con identidad propia, lejos de la estética genérica.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** con design tokens en CSS variables
- **Motion** (Framer Motion) para animaciones y reveals on-scroll
- **Phosphor Icons** para iconografía
- Listo para desplegar en **Vercel**

## Arquitectura (MVVM)

La lógica, los datos y la vista están separados para que el proyecto escale:

```
src/
├─ models/         MODEL · tipos + datos puros (sin React)
│   ├─ menu.types.ts      tipos del menú + formato de precio
│   ├─ menu.data.ts       la carta completa (transcripción exacta)
│   └─ business.data.ts   nombre, ubicación, Instagram, navegación
│
├─ viewmodels/     VIEWMODEL · hooks con estado y acciones (sin JSX)
│   ├─ useMenu.ts          agrupa categorías y maneja la selección
│   ├─ useScrollSpy.ts     sección activa vía IntersectionObserver
│   └─ useReveal.ts        estado de las animaciones on-scroll
│
├─ views/          VIEW · componentes presentacionales (sin lógica de negocio)
│   ├─ sections/   Hero · MenuSection · About · Location · Footer
│   └─ components/ Navbar · LogoSlot · MenuCard · CategoryTabs · GrainOverlay · Reveal
│
├─ app/            Next.js App Router (layout + page componen las vistas)
└─ styles/         tokens.css (variables) · globals.css
```

Reglas: las **views** no contienen lógica de negocio (solo reciben props), los **viewmodels** no contienen JSX y los **models** no importan React.

## Correr en local

Requisitos: Node.js 18.18 o superior.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Scripts disponibles:

| Script          | Qué hace                          |
| --------------- | --------------------------------- |
| `npm run dev`   | Servidor de desarrollo            |
| `npm run build` | Build de producción               |
| `npm run start` | Sirve el build de producción      |
| `npm run lint`  | Linting con ESLint                |

## Desplegar en Vercel

**Opción A · CLI**

```bash
npm i -g vercel      # solo la primera vez
vercel               # despliegue de preview
vercel deploy --prod # despliegue a producción
```

**Opción B · desde Git**

1. Sube el repo a GitHub, GitLab o Bitbucket.
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio.
3. Vercel detecta Next.js automáticamente. No hace falta configurar nada.
4. Deploy.

Tras el despliegue, actualiza `metadataBase` en `src/app/layout.tsx` con el dominio definitivo para que las OG tags apunten bien.

## Personalización (pendientes marcados con `// TODO`)

Antes de publicar, reemplaza estos placeholders. Busca `// TODO` en el código:

- **Logo**: ya integrado. Los PNG `public/logo-emilia-bonita.png` (crema) y `public/logo-emilia-bonita-green.png` (verde) se generan desde `public/logo_maria_bonita.jpeg` recortando el fondo verde a transparente con `node make-logo.mjs` (usa `sharp`). Si cambia el logo, reemplaza el JPEG y vuelve a correr el script.
- **Favicon** (`src/app/icon.png`): generado del mismo emblema (crema sobre verde).
- **Fotos** (Hero y About): hoy usan imágenes de relleno (picsum) con un duotono verde. Sustitúyelas por fotos reales del café en `/public` y cámbialas a `next/image`.
- **Datos de contacto** (`src/models/business.data.ts`): dirección, teléfono y WhatsApp, horarios, coordenadas y mapa con pin exacto ya están cargados (más los datos estructurados `LocalBusiness` para SEO local). Edita ahí si algo cambia.
- **Crédito** (`src/views/sections/Footer.tsx`): agrega el crédito del autor o estudio.
- **Dominio** (`src/app/layout.tsx`): `metadataBase`.

## Notas de diseño

- **Paleta**: verde de bosque (color del logo) como protagonista, crema cálida como página de carta legible, espresso para profundidad. Definida en `src/styles/tokens.css`. Contraste verificado a WCAG AA.
- **Tipografía**: Bricolage Grotesque (titulares, humanista y con carácter), Hanken Grotesk (cuerpo) y Caveat (notas manuscritas puntuales).
- **Accesibilidad**: navegación por teclado, enlace para saltar al contenido, `prefers-reduced-motion` respetado, foco visible y contraste AA.
- **Sin librerías de UI genéricas**: el diseño es propio, con tokens, radios por rol y curvas de easing custom.

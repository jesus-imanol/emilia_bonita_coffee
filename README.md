# Emilia Bonita

Landing page de una sola página para la cafetería **Emilia Bonita**, en Huixtla, Chiapas, México. Café de origen y antojos hechos a mano: una pieza cálida, artesanal y con identidad propia, lejos de la estética genérica.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** con design tokens en CSS variables
- **Motion** (Framer Motion) para animaciones y reveals on-scroll
- **Zustand** para el carrito (persistido en localStorage)
- **Phosphor Icons** para iconografía
- Listo para desplegar en **Vercel**

## Pedidos por WhatsApp

El cliente arma su pedido desde la carta y lo envía al WhatsApp de la cafetería. No hay backend ni pagos: el carrito vive en el navegador y el botón abre WhatsApp con el pedido ya escrito.

- **Agregar:** los productos sin opciones se suman directo; los que tienen sabor, tamaño o ingredientes (frappes, aguas, crepas) abren una hoja para elegir, con su cantidad y comentario.
- **Carrito:** botón con contador en el nav (y barra inferior en móvil); panel lateral con líneas editables y subtotal.
- **Enviar:** arma un mensaje con el pedido, el subtotal, nombre y comentario, y abre `wa.me/<número>`. El cliente indica ahí mismo si es para llevar, en mesa o a domicilio.
- El número destino sale de `business.data.ts` (`whatsapp`). El "Leche deslactosada (+$5)" del Frapuccino Especialidad es un complemento opcional que suma al elegirlo.

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
- **Fotos** (Hero y About): fotos reales del café, optimizadas con `node make-photos.mjs` (sharp) en `public/fotos/`. Para cambiarlas, reemplaza las fuentes en `public/` y vuelve a correr el script.
- **Datos de contacto** (`src/models/business.data.ts`): dirección, teléfono y WhatsApp, horarios, coordenadas y mapa con pin exacto ya están cargados (más los datos estructurados `LocalBusiness` para SEO local). Edita ahí si algo cambia.
- **Crédito** (`src/views/sections/Footer.tsx`): agrega el crédito del autor o estudio.
- **Dominio** (`src/app/layout.tsx`): `metadataBase`.

## Notas de diseño

- **Paleta**: verde de bosque (color del logo) como protagonista, crema cálida como página de carta legible, espresso para profundidad. Definida en `src/styles/tokens.css`. Contraste verificado a WCAG AA.
- **Tipografía**: Bricolage Grotesque (titulares, humanista y con carácter), Hanken Grotesk (cuerpo) y Caveat (notas manuscritas puntuales).
- **Accesibilidad**: navegación por teclado, enlace para saltar al contenido, `prefers-reduced-motion` respetado, foco visible y contraste AA.
- **Sin librerías de UI genéricas**: el diseño es propio, con tokens, radios por rol y curvas de easing custom.

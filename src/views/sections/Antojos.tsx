import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/views/components/Reveal";

// Atajos visuales a la carta: cada foto lleva a su categoría.
const ANTOJOS = [
  {
    label: "Hamburguesas",
    img: "/fotos/hamburguesa.jpg",
    href: "#cat-hamburguesas",
    alt: "Hamburguesa a la plancha con papas",
  },
  {
    label: "Hot dogs",
    img: "/fotos/hotdog.jpg",
    href: "#cat-hot-dogs",
    alt: "Hot dog acompañado de un frappé de oreo",
  },
  {
    label: "Frappes",
    img: "/fotos/frappe.jpg",
    href: "#cat-frappes",
    alt: "Frappé batido con crema y chocolate",
  },
  {
    label: "Café",
    img: "/fotos/cafe.jpg",
    href: "#cat-bebidas-calientes",
    alt: "Café caliente con espuma y canela",
  },
];

export function Antojos() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 sm:pt-28">
        <Reveal>
          <p className="hand text-3xl text-green-soft">se nos antoja</p>
          <h2 className="mt-1 font-display text-4xl font-bold tracking-tight text-bean sm:text-5xl">
            Para abrir boca
          </h2>
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
          {ANTOJOS.map((a, i) => (
            <Reveal key={a.href} delay={i * 0.06}>
              <a
                href={a.href}
                className="lift group relative block aspect-[3/4] overflow-hidden rounded-img ring-1 ring-[var(--line)]"
              >
                <Image
                  src={a.img}
                  alt={a.alt}
                  fill
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bean/85 via-bean/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                  <span className="font-display text-lg font-semibold text-cream">
                    {a.label}
                  </span>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-pill bg-cream/15 text-cream backdrop-blur-sm transition-colors group-hover:bg-green">
                    <ArrowRight size={16} weight="bold" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

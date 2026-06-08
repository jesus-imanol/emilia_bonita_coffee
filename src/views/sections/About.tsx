import Image from "next/image";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { BUSINESS } from "@/models/business.data";
import { Reveal } from "@/views/components/Reveal";

export function About() {
  return (
    <section id="nosotros" className="anchor bg-espresso text-on-green">
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 sm:py-32">
        <Reveal>
          <p className="hand text-3xl text-latte">nosotros</p>
          <h2 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-cream sm:text-5xl">
            De la libreta de espiral, a tu mesa.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-8 sm:mt-12 sm:grid-cols-12 sm:gap-10">
          <Reveal delay={0.05} className="sm:col-span-7">
            <div className="space-y-5 text-lg leading-relaxed text-on-green-dim">
              <p>
                Emilia Bonita es una cafetería en Huixtla, Chiapas. El café de
                la región se prepara con calma y los antojos se arman a mano, uno
                por uno.
              </p>
              <p>
                Nuestra carta empezó en una libreta de espiral, escrita a mano, y
                así la seguimos pensando: cercana, sin complicaciones y con
                sabores que dan ganas de volver.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="sm:col-span-5">
            <div className="rounded-card border border-on-green/15 p-6">
              <p className="hand text-2xl text-latte">lo que servimos</p>
              <p className="mt-2 leading-relaxed text-on-green-dim">
                Café espresso y frappes, crepas dulces y saladas, hamburguesas,
                hot dogs, snacks y postres recién hechos.
              </p>
              <a
                href={BUSINESS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable mt-5 inline-flex items-center gap-2 rounded-pill border border-on-green/40 px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-on-green/10"
              >
                <InstagramLogo size={18} weight="bold" />
                {BUSINESS.instagram.handle}
              </a>
            </div>
          </Reveal>
        </div>

        {/* Galería: fotos reales como impresiones sobre la mesa */}
        <div className="mt-16 grid grid-cols-2 gap-5 sm:mt-20 sm:gap-8">
          <Reveal delay={0.05}>
            <figure className="-rotate-2">
              <div className="rounded-img bg-cream p-2.5 shadow-[var(--shadow-lift)]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[12px]">
                  <Image
                    src="/fotos/crepa.jpg"
                    alt="Crepa de durazno con cajeta y azúcar glas"
                    fill
                    sizes="(min-width: 1024px) 30rem, 45vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </figure>
          </Reveal>
          <Reveal delay={0.12}>
            <figure className="mt-10 rotate-2">
              <div className="rounded-img bg-cream p-2.5 shadow-[var(--shadow-lift)]">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[12px]">
                  <Image
                    src="/fotos/frappe-crepa.jpg"
                    alt="Frappé con crema y crepa de fresa con chocolate"
                    fill
                    sizes="(min-width: 1024px) 30rem, 45vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

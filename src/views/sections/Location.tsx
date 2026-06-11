import Image from "next/image";
import {
  Clock,
  MapPin,
  NavigationArrow,
  Phone,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { BUSINESS } from "@/models/business.data";
import { Reveal } from "@/views/components/Reveal";

export function Location() {
  return (
    <section id="ubicacion" className="anchor bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <Reveal>
          <p className="hand text-3xl text-green-soft">cómo llegar</p>
          <h2 className="mt-2 font-display text-4xl font-bold tracking-tight text-bean sm:text-5xl">
            Te esperamos en Huixtla
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Contacto + mapa */}
          <div className="space-y-8 lg:col-span-7">
            <Reveal delay={0.05}>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <MapPin size={24} weight="duotone" className="mt-0.5 shrink-0 text-green" />
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      {BUSINESS.addressParts.street}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-soft">
                      {BUSINESS.addressParts.postalCode} {BUSINESS.city},{" "}
                      {BUSINESS.state}
                    </p>
                  </div>
                </li>

                <li className="flex gap-4">
                  <Clock size={24} weight="duotone" className="mt-0.5 shrink-0 text-green" />
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      Horarios
                    </p>
                    {BUSINESS.hours.map((h) => (
                      <p key={h.days} className="mt-0.5 text-sm text-ink-soft">
                        <span className="font-medium text-ink">{h.days}:</span>{" "}
                        {h.time}
                      </p>
                    ))}
                  </div>
                </li>

                <li className="flex gap-4">
                  <Phone size={24} weight="duotone" className="mt-0.5 shrink-0 text-green" />
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      Teléfono y WhatsApp
                    </p>
                    <a
                      href={`tel:${BUSINESS.phone.tel}`}
                      className="mt-0.5 inline-block text-sm text-ink-soft underline-offset-2 hover:text-green hover:underline"
                    >
                      {BUSINESS.phone.display}
                    </a>
                  </div>
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={BUSINESS.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable inline-flex items-center gap-2 rounded-pill bg-green px-6 py-3.5 text-base font-semibold text-on-dark hover:bg-bean"
                >
                  <NavigationArrow size={20} weight="bold" />
                  Cómo llegar
                </a>
                <a
                  href={BUSINESS.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable inline-flex items-center gap-2 rounded-pill border border-green/40 px-6 py-3.5 text-base font-semibold text-bean transition-colors hover:bg-green/10"
                >
                  <WhatsappLogo size={20} weight="bold" />
                  WhatsApp
                </a>
              </div>
            </Reveal>

            {/* Mapa con el pin exacto */}
            <Reveal delay={0.1}>
              <div className="overflow-hidden rounded-img border border-[var(--line)]">
                <iframe
                  src={BUSINESS.mapsEmbedUrl}
                  title={`Mapa de ${BUSINESS.name}, ${BUSINESS.city}, ${BUSINESS.state}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block h-[300px] w-full sm:h-[380px]"
                />
              </div>
            </Reveal>
          </div>

          {/* Fachada del local: así reconoces la entrada desde la calle */}
          <Reveal delay={0.08} className="lg:col-span-5">
            <div className="relative aspect-[3/4] overflow-hidden rounded-img border border-[var(--line)] lg:aspect-auto lg:h-full lg:min-h-[420px]">
              <Image
                src="/fotos/fachada.jpg"
                alt="Fachada verde de Emilia Bonita en Huixtla, vista desde la calle"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

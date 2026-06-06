import { InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { BUSINESS } from "@/models/business.data";
import { LogoSlot } from "@/views/components/LogoSlot";
import { Reveal } from "@/views/components/Reveal";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-green-deep text-on-green">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1.2fr]">
            {/* Marca */}
            <div>
              <LogoSlot variant="footer" tone="light" />
              <p className="mt-5 max-w-xs leading-relaxed text-on-green-dim">
                {BUSINESS.tagline}
              </p>
              <p className="hand mt-4 text-2xl text-latte">
                hecho a mano en Huixtla
              </p>
            </div>

            {/* Enlaces */}
            <nav aria-label="Pie de página">
              <p className="text-sm font-semibold text-on-green-dim">Explora</p>
              <ul className="mt-4 space-y-2.5">
                {BUSINESS.nav.map((link) => (
                  <li key={link.id}>
                    <a
                      href={`#${link.id}`}
                      className="text-base text-on-green transition-opacity hover:opacity-70"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Visítanos */}
            <div>
              <p className="text-sm font-semibold text-on-green-dim">Visítanos</p>
              <address className="mt-4 not-italic leading-relaxed text-on-green">
                {BUSINESS.addressParts.street}
                <br />
                {BUSINESS.addressParts.postalCode} {BUSINESS.city},{" "}
                {BUSINESS.state}
              </address>
              <p className="mt-3 text-sm text-on-green-dim">
                {BUSINESS.hours.map((h) => `${h.days}: ${h.time}`).join(". ")}
              </p>
              <a
                href={`tel:${BUSINESS.phone.tel}`}
                className="mt-2 inline-block text-on-green transition-opacity hover:opacity-70"
              >
                {BUSINESS.phone.display}
              </a>
              <div className="mt-4 flex gap-2.5">
                <a
                  href={BUSINESS.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="pressable inline-flex h-11 w-11 items-center justify-center rounded-pill border border-on-green/30 text-on-green transition-colors hover:bg-on-green/10"
                >
                  <InstagramLogo size={20} weight="bold" />
                </a>
                <a
                  href={BUSINESS.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="pressable inline-flex h-11 w-11 items-center justify-center rounded-pill border border-on-green/30 text-on-green transition-colors hover:bg-on-green/10"
                >
                  <WhatsappLogo size={20} weight="bold" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Línea inferior */}
        <div className="mt-14 flex flex-col gap-3 border-t border-on-green/15 pt-6 text-sm text-on-green-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BUSINESS.name}. Todos los derechos reservados.
          </p>
          {/* TODO: agrega aquí el crédito del autor o estudio y su enlace. */}
          <p>Diseñado y desarrollado con cariño.</p>
        </div>
      </div>
    </footer>
  );
}

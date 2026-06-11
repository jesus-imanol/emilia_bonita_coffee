import { BUSINESS } from "@/models/business.data";
import { Navbar } from "@/views/components/Navbar";
import { GrainOverlay } from "@/views/components/GrainOverlay";
import { CartDrawer } from "@/views/components/CartDrawer";
import { CartStickyBar } from "@/views/components/CartStickyBar";
import { ScrollToTop } from "@/views/components/ScrollToTop";
import { Hero } from "@/views/sections/Hero";
import { Antojos } from "@/views/sections/Antojos";
import { MenuSection } from "@/views/sections/MenuSection";
import { About } from "@/views/sections/About";
import { Location } from "@/views/sections/Location";
import { Footer } from "@/views/sections/Footer";

// Datos estructurados (SEO local): horario, dirección, teléfono y geo.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: BUSINESS.name,
  description:
    "Cafetería de origen y antojos hechos a mano en Huixtla, Chiapas.",
  image: "https://emilia-bonita.vercel.app/opengraph-image",
  url: "https://emilia-bonita.vercel.app",
  telephone: BUSINESS.phone.tel,
  priceRange: "$$",
  servesCuisine: ["Café", "Hamburguesas", "Hot dogs", "Crepas", "Postres"],
  address: {
    "@type": "PostalAddress",
    streetAddress: BUSINESS.addressParts.street,
    addressLocality: BUSINESS.city,
    addressRegion: BUSINESS.state,
    postalCode: BUSINESS.addressParts.postalCode,
    addressCountry: "MX",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: BUSINESS.geo.lat,
    longitude: BUSINESS.geo.lng,
  },
  hasMap: BUSINESS.mapsUrl,
  sameAs: [BUSINESS.instagram.url],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
        "Monday",
      ],
      opens: "15:00",
      closes: "23:00",
    },
  ],
};

/**
 * Página única (one-page). Solo compone las vistas; toda la lógica
 * vive en los viewmodels y los datos en los models (MVVM).
 */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GrainOverlay />
      <Navbar />
      <Hero />
      <Antojos />
      <MenuSection />
      <About />
      <Location />
      <Footer />
      <CartDrawer />
      <CartStickyBar />
      <ScrollToTop />
    </>
  );
}

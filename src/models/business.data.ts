/* ============================================================
   MODEL · Datos del negocio (puros, sin React)
   ============================================================ */

export interface NavLink {
  id: string; // id de la sección destino
  label: string;
}

export interface OpeningHours {
  days: string;
  time: string;
}

export interface BusinessInfo {
  name: string;
  tagline: string;
  city: string;
  state: string;
  country: string;
  /** Dirección completa para mostrar. */
  address: string;
  /** Partes de la dirección (para datos estructurados / SEO). */
  addressParts: {
    street: string;
    neighborhood: string;
    postalCode: string;
  };
  /** Coordenadas exactas del local. */
  geo: { lat: number; lng: number };
  phone: { display: string; tel: string };
  whatsapp: { display: string; url: string };
  instagram: { handle: string; url: string };
  /** Enlace corto para el botón "Cómo llegar". */
  mapsUrl: string;
  /** Iframe con el pin exacto (sin API key). */
  mapsEmbedUrl: string;
  hours: OpeningHours[];
  nav: NavLink[];
}

export const BUSINESS: BusinessInfo = {
  name: "Emilia Bonita",
  tagline:
    "Café de origen y antojos hechos a mano en el corazón de Huixtla, Chiapas.",
  city: "Huixtla",
  state: "Chiapas",
  country: "México",

  address: "Av. Central Nte. 22, Barrio del Carmen, 30640 Huixtla, Chiapas",
  addressParts: {
    street: "Av. Central Nte. 22, Barrio del Carmen",
    neighborhood: "Barrio del Carmen",
    postalCode: "30640",
  },
  geo: { lat: 15.1400801, lng: -92.4650173 },

  phone: { display: "+52 964 116 7537", tel: "+529641167537" },
  whatsapp: { display: "+52 964 116 7537", url: "https://wa.me/529641167537" },
  instagram: {
    handle: "@cafeteriaemiliabonita",
    url: "https://instagram.com/cafeteriaemiliabonita",
  },

  mapsUrl: "https://maps.app.goo.gl/txzBG7r5XNcEUdeXA",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=15.1400801,-92.4650173&z=17&hl=es&output=embed",

  hours: [
    { days: "Miércoles a lunes", time: "3:00 p.m. a 11:00 p.m." },
    { days: "Martes", time: "Cerrado" },
  ],

  nav: [
    { id: "inicio", label: "Inicio" },
    { id: "menu", label: "Carta" },
    { id: "nosotros", label: "Nosotros" },
    { id: "ubicacion", label: "Ubicación" },
  ],
};

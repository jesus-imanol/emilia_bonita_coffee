/* ============================================================
   MODEL · Datos del menú (transcripción EXACTA de la carta)
   Precios en pesos mexicanos (MXN). No editar precios ni
   ingredientes sin confirmar con el cliente.
   ============================================================ */

import type { MenuCategory } from "./menu.types";

export const MENU: MenuCategory[] = [
  {
    id: "hamburguesas",
    name: "Hamburguesas",
    tagline: "Carne de res a la parrilla. Las dos van con papas fritas.",
    items: [
      {
        id: "hamburguesa-clasica",
        name: "Clásica",
        note: "c/ papas fritas",
        description:
          "Carne de res, queso manchego, tomate, cebolla caramelizada, lechuga.",
        price: 95,
      },
      {
        id: "hamburguesa-de-la-casa",
        name: "De la casa",
        note: "c/ papas fritas",
        description:
          "Carne de res, chorizo, pimiento, cebolla caramelizada, queso monterey jack, tomate, lechuga.",
        price: 110,
      },
    ],
  },
  {
    id: "hot-dogs",
    name: "Hot Dogs",
    tagline: "Cuatro estilos, del clásico al jalapeño relleno.",
    items: [
      {
        id: "hotdog-tradicional",
        name: "Tradicional",
        description: "Salchicha, pollo, tomate y cebolla.",
        price: 45,
      },
      {
        id: "hotdog-choridogo",
        name: "Choridogo",
        description:
          "Salchicha envuelta en costra de queso con chorizo, cebolla caramelizada, tomate.",
        price: 55,
      },
      {
        id: "hotdog-jalapeno",
        name: "Jalapeño",
        description:
          "Chile jalapeño relleno de salchicha, tocino y queso monterey jack.",
        price: 65,
      },
      {
        id: "hotdog-salchibacon",
        name: "Salchibacon",
        description:
          "Salchicha envuelta con tocino, cebolla caramelizada, tomate, pimiento.",
        price: 55,
      },
    ],
  },
  {
    id: "crepas",
    name: "Crepas",
    tagline: "Dulces o saladas. Tú armas la combinación.",
    optionGroups: [
      {
        label: "Dulces",
        options: [
          "Nutella",
          "Cajeta",
          "Fresa",
          "Durazno",
          "Lechera",
          "Hershey's",
          "Mermelada de fresa y/o zarzamora",
        ],
      },
      {
        label: "Saladas",
        options: [
          "Jamón de pavo",
          "Philadelphia",
          "Queso manchego",
          "Queso monterey jack",
        ],
      },
    ],
    items: [
      { id: "crepa-1", name: "1 Ingrediente", price: 70 },
      { id: "crepa-2", name: "2 Ingredientes", price: 75 },
    ],
  },
  {
    id: "snacks",
    name: "Snacks",
    tagline: "Para compartir (o no).",
    items: [
      {
        id: "snack-alitas",
        name: "Alitas BBQ",
        note: "8 pzas",
        price: 110,
      },
      {
        id: "snack-papas-francesa",
        name: "Orden de papas a la francesa",
        price: 45,
      },
      {
        id: "snack-papas-gajos",
        name: "Orden de papas gajos",
        price: 50,
      },
    ],
  },
  {
    id: "postres",
    name: "Postres",
    tagline: "En rebanada, para cerrar dulce.",
    items: [
      { id: "postre-pay-queso", name: "Pay de queso", price: 30 },
      {
        id: "postre-panque",
        name: "Panque",
        options: ["Elote", "Zanahoria"],
        price: 30,
      },
      { id: "postre-flan", name: "Flan napolitano", price: 45 },
    ],
  },
  {
    id: "bebidas-calientes",
    name: "Bebidas Calientes",
    tagline: "Café espresso, recién hecho.",
    items: [
      { id: "caliente-espresso", name: "Espresso", price: 40 },
      { id: "caliente-americano", name: "Americano", price: 30 },
      {
        id: "caliente-capuccino",
        name: "Capuccino",
        options: ["Cajeta", "Moka", "Tradicional"],
        price: 55,
      },
    ],
  },
  {
    id: "frappes",
    name: "Frappes",
    tagline: "Fríos, batidos y bien servidos.",
    items: [
      {
        id: "frappe-frapuccino",
        name: "Frapuccino",
        options: ["Tradicional", "Vainilla francesa", "Cajeta", "Moka", "Oreo"],
        price: 70,
      },
      {
        id: "frappe-especialidad",
        name: "Frapuccino Especialidad",
        options: [
          "Nutella",
          "Kahlúa",
          "Chocolate blanco",
          "Cookies and cream",
          "Baileys",
        ],
        extra: "Extra $5",
        price: 75,
      },
    ],
  },
  {
    id: "bebidas-frias",
    name: "Bebidas Frías",
    tagline: "Para el calor de Huixtla.",
    items: [
      {
        id: "fria-malteadas",
        name: "Malteadas",
        options: ["Chocolate", "Vainilla", "Cookies and cream"],
        price: 65,
      },
      { id: "fria-refrescos", name: "Refrescos embotellados", price: 30 },
      { id: "fria-agua", name: "Agua embotellada", price: 25 },
      {
        id: "fria-aguas",
        name: "Aguas",
        options: ["Horchata", "Jamaica"],
        variants: [
          { label: "½ Lt", price: 25 },
          { label: "1 Lt", price: 35 },
        ],
      },
    ],
  },
];

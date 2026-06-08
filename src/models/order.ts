/* ============================================================
   MODEL · Arma el mensaje de pedido y la URL de WhatsApp (puro)
   Sin guiones largos: solo "-" y ":".
   ============================================================ */

import { BUSINESS } from "./business.data";
import { formatMXN } from "./menu.types";
import {
  cartSubtotal,
  lineTotal,
  type CartLine,
  type OrderDetails,
} from "./cart.types";

function describeLine(line: CartLine): string {
  let title = line.name;
  if (line.variantLabel) title += ` (${line.variantLabel})`;

  const detail: string[] = [];
  if (line.flavor) detail.push(line.flavor);
  if (line.ingredients?.length) detail.push(line.ingredients.join(", "));

  let head = detail.length ? `${title} - ${detail.join(", ")}` : title;
  if (line.extra && line.extraLabel) {
    head += ` (con ${line.extraLabel.toLowerCase()})`;
  }
  return head;
}

export function buildOrderMessage(
  lines: CartLine[],
  details: OrderDetails
): string {
  const items = lines
    .map((line, i) => {
      const head = `${i + 1}) ${describeLine(line)}`;
      const noteLine = line.note?.trim()
        ? `\n   Comentario: ${line.note.trim()}`
        : "";
      const qtyLine = `\n   Cantidad: ${line.qty} - ${formatMXN(lineTotal(line))}`;
      return head + noteLine + qtyLine;
    })
    .join("\n");

  const parts: string[] = [
    "Hola Emilia Bonita! Quiero hacer un pedido:",
    "",
    items,
    "",
    `Subtotal: ${formatMXN(cartSubtotal(lines))}`,
  ];

  const tail: string[] = [];
  if (details.name?.trim()) tail.push(`Nombre: ${details.name.trim()}`);
  if (details.comment?.trim())
    tail.push(`Comentario: ${details.comment.trim()}`);
  if (tail.length) parts.push("", ...tail);

  return parts.join("\n");
}

export function buildWhatsAppUrl(
  lines: CartLine[],
  details: OrderDetails
): string {
  const message = buildOrderMessage(lines, details);
  return `${BUSINESS.whatsapp.url}?text=${encodeURIComponent(message)}`;
}

/* ============================================================
   Identidades especiales (detalles personales). Edita con tus datos.
   ============================================================ */

/** La mesera que recibe el mensaje diario. */
export const ODALIS_EMAIL = "ortizodaliz13@gmail.com";
export const ODALIS_NAMES = ["odalis", "ortiz", "odalis ortiz", "oda"];

/**
 * TU correo de acceso al panel (con el que inicias sesión).
 * SOLO con este correo aparece y se gestiona el panel de mensajes;
 * ni el dueño lo ve aunque entre como admin.  ←← PON AQUÍ TU CORREO
 */
export const MESSAGES_ADMIN_EMAIL = "jesusimanolcastillo@gmail.com";

/** Mensaje de respaldo si aún no has escrito ninguno. */
export const DEFAULT_LOVE_MESSAGE =
  "Te amo muchísimo. Gracias por hacerme tan feliz. 🤍";

export function isOdalis(email: string | null, fullName: string | null): boolean {
  const e = (email ?? "").toLowerCase();
  const n = (fullName ?? "").trim().toLowerCase();
  return e === ODALIS_EMAIL || ODALIS_NAMES.includes(n);
}

export function isMessagesAdmin(email: string | null): boolean {
  return (email ?? "").toLowerCase() === MESSAGES_ADMIN_EMAIL.toLowerCase();
}

/**
 * VIEW · Capa de grano de papel. Fija, decorativa, no interactiva.
 * La textura vive solo aquí (capa fija) para no repintar en cada scroll.
 */
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}

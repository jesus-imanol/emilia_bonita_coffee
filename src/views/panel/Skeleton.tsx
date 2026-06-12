export function Skel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-input bg-cream-deep/70 ${className}`}
    />
  );
}

export function SkelCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-card border border-[var(--line)] bg-cream-deep/40 ${className}`}
    />
  );
}

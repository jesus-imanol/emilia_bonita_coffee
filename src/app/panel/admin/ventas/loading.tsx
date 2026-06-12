import { Skel, SkelCard } from "@/views/panel/Skeleton";

export default function VentasLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-16">
      <Skel className="h-4 w-32" />
      <Skel className="mt-3 h-8 w-28" />
      <Skel className="mt-4 h-9 w-64 rounded-pill" />
      <SkelCard className="mt-5 h-28" />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <SkelCard className="h-16" />
        <SkelCard className="h-16" />
      </div>
    </main>
  );
}

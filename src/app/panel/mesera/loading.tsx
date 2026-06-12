import { Skel, SkelCard } from "@/views/panel/Skeleton";

export default function MeseraLoading() {
  return (
    <main className="mx-auto max-w-md px-4 py-6 pb-28">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skel className="h-16 w-12 rounded-2xl" />
          <div>
            <Skel className="h-3 w-28" />
            <Skel className="mt-2 h-6 w-36" />
          </div>
        </div>
        <Skel className="h-9 w-20 rounded-pill" />
      </div>

      <SkelCard className="mt-5 h-16" />

      <Skel className="mt-7 h-4 w-28" />
      <div className="mt-3 space-y-2.5">
        <SkelCard className="h-20" />
        <SkelCard className="h-20" />
        <SkelCard className="h-20" />
      </div>
    </main>
  );
}

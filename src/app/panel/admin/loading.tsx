import { Skel, SkelCard } from "@/views/panel/Skeleton";

export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 pb-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Skel className="h-7 w-28" />
          <Skel className="mt-2 h-4 w-40" />
        </div>
        <Skel className="h-9 w-20 rounded-pill" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <SkelCard className="h-16" />
        <SkelCard className="h-16" />
        <SkelCard className="h-16" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <SkelCard className="h-20" />
        <SkelCard className="h-20" />
        <SkelCard className="h-20" />
      </div>

      <Skel className="mt-8 h-4 w-36" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SkelCard className="h-44" />
        <SkelCard className="h-44" />
      </div>
    </main>
  );
}

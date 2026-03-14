import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 lg:px-8">
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-[320px] w-full rounded-2xl" />
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, idx) => (
          <Skeleton key={idx} className="aspect-[2/3] w-full" />
        ))}
      </div>
    </main>
  );
}

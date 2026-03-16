import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth";
import { getMovieGenres } from "@/services/tmdb";
import type { MediaType } from "@/types/tmdb";
import { SearchFilters } from "./_components/search-filters";
import { SearchResults } from "./_components/search-results";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    minRating?: string;
    minPopularity?: string;
    type?: MediaType;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  await requireAuth();
  const params = await searchParams;

  const { genres } = await getMovieGenres();

  return (
    <AppShell>
      <section className="space-y-5 reveal">
        <h1 className="text-4xl font-black">Busca e Filtros</h1>

        <SearchFilters genres={genres} initialParams={params} />

        <Suspense fallback={<ResultsSkeleton />}>
          <SearchResults params={params} />
        </Suspense>
      </section>
    </AppShell>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-64 animate-pulse rounded-lg bg-white/10" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-2/3 animate-pulse rounded-xl bg-white/10" />
        ))}
      </div>
    </div>
  );
}

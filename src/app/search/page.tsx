import { AppShell } from "@/components/layout/app-shell";
import { MovieCard } from "@/components/movie/movie-card";
import { Input } from "@/components/ui/input";
import { requireAuth } from "@/lib/auth";
import { discoverWithFilters, getMovieGenres, searchMulti } from "@/services/tmdb";
import type { MediaType } from "@/types/tmdb";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    releaseDate?: string;
    minRating?: string;
    minPopularity?: string;
    type?: MediaType;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await requireAuth();
  const params = await searchParams;

  const mediaType = params.type === "tv" ? "tv" : "movie";
  const [genres, searchData, discovery] = await Promise.all([
    getMovieGenres(),
    params.q ? searchMulti(params.q) : Promise.resolve(null),
    discoverWithFilters({
      mediaType,
      genre: params.genre,
      releaseDateGte: params.releaseDate,
      voteAverageGte: params.minRating,
      popularityGte: params.minPopularity,
    }),
  ]);

  const searchResults = (searchData?.results ?? []).filter(
    (item) => (item.media_type === "movie" || item.media_type === "tv") && item.poster_path,
  );

  const filteredResults = discovery.results.filter((item) => item.poster_path);

  return (
    <AppShell user={{ name: session.user.name, username: session.user.username, image: session.user.image }}>
      <section className="space-y-5 reveal">
        <h1 className="text-4xl font-black">Busca e Filtros</h1>

        <form className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-4 md:grid-cols-6" action="/search" method="GET">
          <Input name="q" defaultValue={params.q ?? ""} placeholder="Filme ou série" className="md:col-span-2" />

          <select
            name="type"
            defaultValue={mediaType}
            className="h-10 rounded-md border border-white/20 bg-black/30 px-3 text-sm text-white"
          >
            <option value="movie">Filme</option>
            <option value="tv">Série</option>
          </select>

          <select
            name="genre"
            defaultValue={params.genre ?? ""}
            className="h-10 rounded-md border border-white/20 bg-black/30 px-3 text-sm text-white"
          >
            <option value="">Gênero</option>
            {genres.genres.map((genre) => (
              <option value={genre.id} key={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>

          <Input type="date" name="releaseDate" defaultValue={params.releaseDate ?? ""} />
          <Input type="number" min="0" max="10" step="0.1" name="minRating" defaultValue={params.minRating ?? ""} placeholder="Nota min" />
          <Input
            type="number"
            min="0"
            step="10"
            name="minPopularity"
            defaultValue={params.minPopularity ?? ""}
            placeholder="Popularidade"
          />

          <button
            type="submit"
            className="md:col-span-6 h-10 rounded-md bg-[var(--accent)] text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Aplicar filtros
          </button>
        </form>

        {params.q && (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold">Resultados para &quot;{params.q}&quot;</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {searchResults.map((item) => (
                <MovieCard key={`search-${item.id}`} item={item} mediaType={(item.media_type as MediaType) ?? "movie"} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h2 className="text-2xl font-bold">Descobrir com filtros</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {filteredResults.map((item) => (
              <MovieCard key={`discover-${item.id}`} item={item} mediaType={mediaType} />
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}

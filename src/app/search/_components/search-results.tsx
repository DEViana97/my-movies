import { MovieCard } from "@/components/movie/movie-card";
import { discoverWithFilters, searchMulti } from "@/services/tmdb";
import type { MediaType } from "@/types/tmdb";

type SearchParams = {
  q?: string;
  genre?: string;
  minRating?: string;
  minPopularity?: string;
  type?: MediaType;
};

export async function SearchResults({ params }: { params: SearchParams }) {
  const mediaType = params.type === "tv" ? "tv" : "movie";

  const [searchData, discovery] = await Promise.all([
    params.q ? searchMulti(params.q) : Promise.resolve(null),
    discoverWithFilters({
      mediaType,
      genre: params.genre,
      voteAverageGte: params.minRating,
      popularityGte: params.minPopularity,
    }),
  ]);

  const searchResults = (searchData?.results ?? []).filter(
    (item) => (item.media_type === "movie" || item.media_type === "tv") && item.poster_path,
  );

  const filteredResults = discovery.results.filter((item) => item.poster_path);

  return (
    <>
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
    </>
  );
}

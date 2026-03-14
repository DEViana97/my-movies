import type { UserListItem } from "@prisma/client";
import { MovieCard } from "@/components/movie/movie-card";
import type { TmdbMedia } from "@/types/tmdb";

export function UserListGrid({ items }: { items: UserListItem[] }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 bg-black/20 p-10 text-center text-white/70">
        Sua lista ainda está vazia.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => {
        const tmdbLike: TmdbMedia = {
          id: item.tmdbId,
          title: item.title,
          name: item.title,
          overview: item.overview ?? "Sem sinopse disponível.",
          poster_path: item.posterPath,
          vote_average: item.voteAverage ?? 0,
          release_date: item.releaseDate ?? undefined,
          media_type: item.mediaType,
        };

        return (
          <MovieCard
            key={`${item.listType}-${item.tmdbId}`}
            item={tmdbLike}
            mediaType={item.mediaType}
            status={{
              favorite: item.listType === "FAVORITE",
              watchLater: item.listType === "WATCH_LATER",
              watched: item.listType === "WATCHED",
            }}
          />
        );
      })}
    </div>
  );
}

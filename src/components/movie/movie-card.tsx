import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MovieActions } from "@/components/movie/movie-actions";
import { Badge } from "@/components/ui/badge";
import { buildTmdbImage, getYear } from "@/lib/utils";
import type { MediaType, TmdbMedia } from "@/types/tmdb";

type MovieCardProps = {
  item: TmdbMedia;
  mediaType: MediaType;
  status?: {
    favorite?: boolean;
    watchLater?: boolean;
    watched?: boolean;
  };
};

export function MovieCard({ item, mediaType, status }: MovieCardProps) {
  const title = item.title ?? item.name ?? "Sem título";
  const release = item.release_date ?? item.first_air_date;

  return (
    <article className="group relative w-[190px] shrink-0 overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm dark:border-white/10 dark:bg-black/30 dark:shadow-none">
      <Link href={`/movies/${item.id}?type=${mediaType}`}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={buildTmdbImage(item.poster_path)}
            alt={title}
            fill
            sizes="190px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-75" />
        </div>
      </Link>

      <div className="space-y-2 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{title}</h3>
        <p className="line-clamp-2 text-xs text-foreground/60">{item.overview || "Sem sinopse disponível."}</p>
        <div className="flex items-center justify-between text-xs text-foreground/60">
          <Badge>{getYear(release)}</Badge>
          <span className="inline-flex items-center gap-1">
            <Star size={12} className="fill-[var(--accent)] text-[var(--accent)]" />
            {item.vote_average.toFixed(1)}
          </span>
        </div>

        <div className="opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
          <MovieActions
            tmdbId={item.id}
            mediaType={mediaType}
            title={title}
            overview={item.overview}
            posterPath={item.poster_path ?? undefined}
            voteAverage={item.vote_average}
            releaseDate={release}
            initialFavorite={status?.favorite}
            initialWatchLater={status?.watchLater}
            initialWatched={status?.watched}
            compact
          />
        </div>
      </div>
    </article>
  );
}

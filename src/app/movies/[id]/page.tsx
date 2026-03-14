import { ListType } from "@prisma/client";
import { CalendarDays, Star } from "lucide-react";
import Image from "next/image";
import { AppShell } from "@/components/layout/app-shell";
import { MovieActions } from "@/components/movie/movie-actions";
import { Badge } from "@/components/ui/badge";
import { requireAuth } from "@/lib/auth";
import { buildTmdbImage } from "@/lib/utils";
import { getMediaDetails, getMediaTrailer } from "@/services/tmdb";
import { getUserListItems } from "@/services/user-lists";
import type { MediaType } from "@/types/tmdb";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: MediaType }>;
};

export default async function MovieDetailsPage({ params, searchParams }: PageProps) {
  const session = await requireAuth();
  const { id } = await params;
  const { type } = await searchParams;
  const mediaType = type === "tv" ? "tv" : "movie";

  const [details, trailer, favorites, watchLater, watched] = await Promise.all([
    getMediaDetails(id, mediaType),
    getMediaTrailer(id, mediaType),
    getUserListItems(session.user.id, ListType.FAVORITE),
    getUserListItems(session.user.id, ListType.WATCH_LATER),
    getUserListItems(session.user.id, ListType.WATCHED),
  ]);

  const isFavorite = favorites.some((item) => item.tmdbId === details.id && item.mediaType === mediaType);
  const isWatchLater = watchLater.some((item) => item.tmdbId === details.id && item.mediaType === mediaType);
  const isWatched = watched.some((item) => item.tmdbId === details.id && item.mediaType === mediaType);

  const title = details.title ?? details.name ?? "Sem título";
  const releaseDate = details.release_date ?? details.first_air_date;

  return (
    <AppShell user={{ name: session.user.name, username: session.user.username, image: session.user.image }}>
      <article className="space-y-8 reveal">
        <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/35">
          <div className="grid gap-6 p-5 md:grid-cols-[280px_1fr] md:p-7">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-[280px] overflow-hidden rounded-xl">
              <Image src={buildTmdbImage(details.poster_path)} alt={title} fill className="object-cover" />
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">{mediaType === "movie" ? "Filme" : "Série"}</p>
              <h1 className="text-4xl font-black md:text-5xl">{title}</h1>
              <p className="max-w-3xl text-sm text-white/80 md:text-base">{details.overview || "Sem sinopse."}</p>

              <div className="flex flex-wrap gap-2">
                {details.genres.map((genre) => (
                  <Badge key={genre.id}>{genre.name}</Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={15} />
                  {releaseDate ?? "Data não informada"}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star size={15} className="fill-[var(--accent)] text-[var(--accent)]" />
                  {details.vote_average.toFixed(1)}
                </span>
              </div>

              <MovieActions
                tmdbId={details.id}
                mediaType={mediaType}
                title={title}
                overview={details.overview}
                posterPath={details.poster_path ?? undefined}
                voteAverage={details.vote_average}
                releaseDate={releaseDate}
                initialFavorite={isFavorite}
                initialWatchLater={isWatchLater}
                initialWatched={isWatched}
              />
            </div>
          </div>
        </section>

        {trailer?.key && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">Trailer</h2>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <iframe
                title={`${title} trailer`}
                className="aspect-video w-full"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </section>
        )}
      </article>
    </AppShell>
  );
}

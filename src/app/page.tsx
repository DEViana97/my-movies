import dynamic from "next/dynamic";
import { AppShell } from "@/components/layout/app-shell";
import { MovieHorizontalList } from "@/components/movie/movie-horizontal-list";
import { requireAuth } from "@/lib/auth";
import { getMovieGenres, getMoviesByGenre, getPopularMovies, getPopularSeries, getTopRatedMovies, getUpcomingMovies } from "@/services/tmdb";
import { getUserListStatus } from "@/services/user-lists";

const MovieCarousel = dynamic(() => import("@/components/movie/movie-carousel").then((mod) => mod.MovieCarousel), {
  loading: () => <div className="h-[320px] animate-pulse rounded-2xl bg-white/10" />,
});

export default async function Home() {
  const session = await requireAuth();

  const [popularMovies, popularSeries, topRated, upcoming, genres] = await Promise.all([
    getPopularMovies(),
    getPopularSeries(),
    getTopRatedMovies(),
    getUpcomingMovies(),
    getMovieGenres(),
  ]);

  const featuredGenre = genres.genres.slice(0, 2);
  const genresLists = await Promise.all(featuredGenre.map((genre) => getMoviesByGenre(genre.id)));

  const status = await getUserListStatus(
    session.user.id,
    [
      ...popularMovies.results.slice(0, 16),
      ...topRated.results.slice(0, 16),
      ...upcoming.results.slice(0, 16),
      ...genresLists.flatMap((list) => list.results.slice(0, 16)),
    ].map((item) => item.id),
  );

  const statusMap: Record<number, { favorite: boolean; watchLater: boolean; watched: boolean }> = {};
  for (const id of new Set([...status.favoriteIds, ...status.watchLaterIds, ...status.watchedIds])) {
    statusMap[id] = {
      favorite: status.favoriteIds.has(id),
      watchLater: status.watchLaterIds.has(id),
      watched: status.watchedIds.has(id),
    };
  }

  return (
    <AppShell user={{ name: session.user.name, username: session.user.username, image: session.user.image }}>
      <div className="space-y-8 reveal">
        <div className="stagger grid gap-8">
          <MovieCarousel title="Filmes populares" mediaType="movie" items={popularMovies.results} />
          <MovieCarousel title="Séries populares" mediaType="tv" items={popularSeries.results} />
        </div>

        <div className="stagger grid gap-7">
          <MovieHorizontalList title="Populares" mediaType="movie" items={popularMovies.results} statusMap={statusMap} />
          <MovieHorizontalList title="Mais bem avaliados" mediaType="movie" items={topRated.results} statusMap={statusMap} />
          <MovieHorizontalList title="Lançamentos" mediaType="movie" items={upcoming.results} statusMap={statusMap} />

          {genresLists.map((list, idx) => (
            <MovieHorizontalList
              key={featuredGenre[idx].id}
              title={`Gênero: ${featuredGenre[idx].name}`}
              mediaType="movie"
              items={list.results}
              statusMap={statusMap}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

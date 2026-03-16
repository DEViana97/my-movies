import { apiClient } from "@/services/api-client";
import type { MediaType, TmdbDetails, TmdbGenre, TmdbMedia, TmdbPagedResponse, TmdbVideo } from "@/types/tmdb";

type GenreResponse = { genres: TmdbGenre[] };
type VideoResponse = { results: TmdbVideo[] };

export async function getPopularMovies() {
  return apiClient<TmdbPagedResponse<TmdbMedia>>("/movie/popular");
}

export async function getPopularSeries() {
  return apiClient<TmdbPagedResponse<TmdbMedia>>("/tv/popular");
}

export async function getTopRatedMovies() {
  return apiClient<TmdbPagedResponse<TmdbMedia>>("/movie/top_rated");
}

export async function getUpcomingMovies() {
  return apiClient<TmdbPagedResponse<TmdbMedia>>("/movie/upcoming");
}

export async function getMovieGenres() {
  return apiClient<GenreResponse>("/genre/movie/list");
}

export async function getMoviesByGenre(genreId: number) {
  return apiClient<TmdbPagedResponse<TmdbMedia>>(`/discover/movie?with_genres=${genreId}`);
}

export async function getMediaDetails(id: string, mediaType: MediaType = "movie") {
  return apiClient<TmdbDetails>(`/${mediaType}/${id}`);
}

export async function getMediaTrailer(id: string, mediaType: MediaType = "movie") {
  const data = await apiClient<VideoResponse>(`/${mediaType}/${id}/videos`);
  return data.results.find((video) => video.site === "YouTube" && video.type === "Trailer") ?? null;
}

type MovieReleaseDatesResponse = {
  id: number;
  results: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      release_date: string;
      type: number;
    }>;
  }>;
};

export async function searchMulti(query: string) {
  return apiClient<TmdbPagedResponse<TmdbMedia>>(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`);
}

export async function getMovieReleaseDates(movieId: number) {
  return apiClient<MovieReleaseDatesResponse>(`/movie/${movieId}/release_dates`);
}

type WatchProvider = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
};

type WatchProviderCountry = {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
};

type WatchProvidersResponse = {
  id: number;
  results: Record<string, WatchProviderCountry>;
};

export async function getWatchProviders(id: string, mediaType: MediaType = "movie") {
  return apiClient<WatchProvidersResponse>(`/${mediaType}/${id}/watch/providers`);
}

export async function discoverWithFilters(filters: {
  mediaType: MediaType;
  genre?: string;
  releaseDateGte?: string;
  voteAverageGte?: string;
  popularityGte?: string;
}) {
  const path = new URLSearchParams();
  if (filters.genre) path.set("with_genres", filters.genre);
  if (filters.voteAverageGte) path.set("vote_average.gte", filters.voteAverageGte);
  if (filters.popularityGte) path.set("popularity.gte", filters.popularityGte);

  if (filters.releaseDateGte) {
    if (filters.mediaType === "movie") {
      // Use region-specific release dates and theatrical types from TMDB release types.
      path.set("region", "BR");
      path.set("with_release_type", "2|3");
      path.set("release_date.gte", filters.releaseDateGte);
    } else {
      path.set("first_air_date.gte", filters.releaseDateGte);
    }
  }

  return apiClient<TmdbPagedResponse<TmdbMedia>>(`/discover/${filters.mediaType}?${path.toString()}`);
}

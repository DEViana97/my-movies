export type MediaType = "movie" | "tv";

export type TmdbMedia = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: MediaType;
  popularity?: number;
};

export type TmdbGenre = {
  id: number;
  name: string;
};

export type TmdbPagedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export type TmdbVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
};

export type TmdbDetails = {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genres: TmdbGenre[];
};

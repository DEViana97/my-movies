import type { MediaType, TmdbMedia } from "@/types/tmdb";
import { MovieCard } from "@/components/movie/movie-card";

type StatusMap = Record<number, { favorite: boolean; watchLater: boolean; watched: boolean }>;

type MovieHorizontalListProps = {
  title: string;
  mediaType: MediaType;
  items: TmdbMedia[];
  statusMap?: StatusMap;
};

export function MovieHorizontalList({ title, mediaType, items, statusMap }: MovieHorizontalListProps) {
  return (
    <section className="min-w-0 space-y-3">
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      <div className="w-full min-w-0 flex gap-3 overflow-x-auto pb-2">
        {items.slice(0, 16).map((item) => (
          <MovieCard key={`${mediaType}-${item.id}`} item={item} mediaType={mediaType} status={statusMap?.[item.id]} />
        ))}
      </div>
    </section>
  );
}

"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { buildTmdbImage } from "@/lib/utils";
import type { MediaType, TmdbMedia } from "@/types/tmdb";

type MovieCarouselProps = {
  title: string;
  mediaType: MediaType;
  items: TmdbMedia[];
};

export function MovieCarousel({ title, mediaType, items }: MovieCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={scrollPrev} aria-label="Anterior">
            <ChevronLeft size={16} />
          </Button>
          <Button variant="secondary" size="icon" onClick={scrollNext} aria-label="Próximo">
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10" ref={emblaRef}>
        <div className="flex">
          {items.slice(0, 8).map((item) => {
            const itemTitle = item.title ?? item.name ?? "Sem título";
            return (
              <div className="relative min-w-0 flex-[0_0_100%]" key={`${mediaType}-${item.id}`}>
                <div className="relative h-[46vh] min-h-[320px] w-full">
                  <Image
                    src={buildTmdbImage(item.backdrop_path ?? item.poster_path, "w780")}
                    alt={itemTitle}
                    fill
                    priority
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full space-y-3 p-6 md:max-w-[60%] md:p-8">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Destaque</p>
                    <h3 className="text-2xl font-black md:text-4xl">{itemTitle}</h3>
                    <p className="line-clamp-2 text-sm text-white/80 md:text-base">{item.overview}</p>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1 text-sm text-white/90">
                        <Star size={14} className="fill-[var(--accent)] text-[var(--accent)]" />
                        {item.vote_average.toFixed(1)}
                      </span>
                      <Link
                        href={`/movies/${item.id}?type=${mediaType}`}
                        className="inline-flex h-10 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-bold text-white transition hover:bg-[var(--accent-strong)]"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

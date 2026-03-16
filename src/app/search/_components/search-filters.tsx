"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import type { MediaType } from "@/types/tmdb";

type Genre = { id: number; name: string };

type InitialParams = {
  q?: string;
  genre?: string;
  minRating?: string;
  type?: MediaType;
};

export function SearchFilters({ genres, initialParams }: { genres: Genre[]; initialParams: InitialParams }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(initialParams.q ?? "");
  const [type, setType] = useState(initialParams.type ?? "movie");
  const [genre, setGenre] = useState(initialParams.genre ?? "");
  const [minRating, setMinRating] = useState(initialParams.minRating ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("type", type);
    if (genre) params.set("genre", genre);
    if (minRating) params.set("minRating", minRating);

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  }

  return (
    <form
      className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-4 md:grid-cols-6"
      onSubmit={handleSubmit}
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filme ou série"
        className="md:col-span-2"
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value as MediaType)}
        className="h-10 rounded-md border border-white/20 bg-black/30 px-3 text-sm text-white"
      >
        <option value="movie">Filme</option>
        <option value="tv">Série</option>
      </select>

      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="h-10 rounded-md border border-white/20 bg-black/30 px-3 text-sm text-white"
      >
        <option value="">Gênero</option>
        {genres.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      <Input
        type="number"
        min="0"
        max="10"
        step="0.1"
        value={minRating}
        onChange={(e) => setMinRating(e.target.value)}
        placeholder="Nota minima"
      />

      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-md bg-(--accent) text-sm font-bold text-white transition hover:bg-(--accent-strong) disabled:opacity-60 md:col-span-6"
      >
        {isPending ? "Buscando..." : "Aplicar filtros"}
      </button>
    </form>
  );
}

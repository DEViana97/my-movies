"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pin, Star } from "lucide-react";
import { useState } from "react";
import { useMovieUIStore } from "@/store/use-movie-ui-store";
import type { MediaType } from "@/types/tmdb";
import { Button } from "@/components/ui/button";

type MovieActionsProps = {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview?: string;
  posterPath?: string | null;
  voteAverage?: number;
  releaseDate?: string;
  initialFavorite?: boolean;
  initialWatchLater?: boolean;
  initialWatched?: boolean;
  compact?: boolean;
};

async function saveListItem(listType: "FAVORITE" | "WATCH_LATER" | "WATCHED", payload: Omit<MovieActionsProps, "compact">) {
  const res = await fetch("/api/user-lists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ listType, ...payload }),
  });

  if (!res.ok) {
    throw new Error("Falha ao salvar item");
  }
}

async function removeListItem(listType: "FAVORITE" | "WATCH_LATER" | "WATCHED", tmdbId: number, mediaType: MediaType) {
  const res = await fetch("/api/user-lists", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ listType, tmdbId, mediaType }),
  });

  if (!res.ok) {
    throw new Error("Falha ao remover item");
  }
}

export function MovieActions({ compact, ...props }: MovieActionsProps) {
  const queryClient = useQueryClient();
  const setLastAction = useMovieUIStore((state) => state.setLastAction);
  const showToast = useMovieUIStore((state) => state.showToast);
  const [isFavorite, setIsFavorite] = useState(Boolean(props.initialFavorite));
  const [isWatchLater, setIsWatchLater] = useState(Boolean(props.initialWatchLater));
  const [isWatched, setIsWatched] = useState(Boolean(props.initialWatched));

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ["favorites"] });
    queryClient.invalidateQueries({ queryKey: ["watch-later"] });
    queryClient.invalidateQueries({ queryKey: ["watched"] });
  };

  const mutation = useMutation({
    mutationFn: async (next: { action: "favorite" | "watchLater" | "watched" }) => {
      if (next.action === "favorite") {
        if (isFavorite) {
          await removeListItem("FAVORITE", props.tmdbId, props.mediaType);
        } else {
          await saveListItem("FAVORITE", props);
        }
      }

      if (next.action === "watchLater") {
        if (isWatchLater) {
          await removeListItem("WATCH_LATER", props.tmdbId, props.mediaType);
        } else {
          await saveListItem("WATCH_LATER", props);
        }
      }

      if (next.action === "watched") {
        if (isWatched) {
          await removeListItem("WATCHED", props.tmdbId, props.mediaType);
        } else {
          await saveListItem("WATCHED", props);
          await removeListItem("WATCH_LATER", props.tmdbId, props.mediaType);
        }
      }
    },
    onSuccess: (_, variables) => {
      if (variables.action === "favorite") {
        setIsFavorite((prev) => !prev);
        setLastAction(isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
      }
      if (variables.action === "watchLater") {
        setIsWatchLater((prev) => !prev);
        setLastAction(isWatchLater ? "Removido de assistir depois" : "Salvo para assistir depois");
      }
      if (variables.action === "watched") {
        if (isWatched) {
          setIsWatched(false);
          setLastAction("Removido dos assistidos");
        } else {
          setIsWatched(true);
          setIsWatchLater(false);
          setLastAction("Marcado como assistido");
        }
      }

      invalidateLists();
    },
    onError: (error) => {
      showToast(error instanceof Error ? error.message : "Nao foi possivel concluir a acao", "error");
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Button
        size={compact ? "icon" : "sm"}
        variant={isFavorite ? "default" : "secondary"}
        onClick={() => mutation.mutate({ action: "favorite" })}
        disabled={mutation.isPending}
        aria-label="Favoritar"
      >
        <Star size={16} className={isFavorite ? "fill-current" : ""} />
      </Button>

      <Button
        size={compact ? "icon" : "sm"}
        variant={isWatchLater ? "default" : "secondary"}
        onClick={() => mutation.mutate({ action: "watchLater" })}
        disabled={mutation.isPending}
        aria-label="Assistir depois"
      >
        <Pin size={16} className={isWatchLater ? "fill-current" : ""} />
      </Button>

      <Button
        size={compact ? "icon" : "sm"}
        variant={isWatched ? "default" : "outline"}
        onClick={() => mutation.mutate({ action: "watched" })}
        disabled={mutation.isPending}
        aria-label="Marcar assistido"
      >
        <Check size={16} className={isWatched ? "fill-current" : ""} />
      </Button>
    </div>
  );
}

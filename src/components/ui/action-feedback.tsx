"use client";

import { useEffect } from "react";
import { useMovieUIStore } from "@/store/use-movie-ui-store";

export function ActionFeedback() {
  const lastAction = useMovieUIStore((state) => state.lastAction);
  const setLastAction = useMovieUIStore((state) => state.setLastAction);

  useEffect(() => {
    if (!lastAction) return;
    const timeout = setTimeout(() => setLastAction(null), 2200);
    return () => clearTimeout(timeout);
  }, [lastAction, setLastAction]);

  if (!lastAction) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[999] rounded-md border border-white/20 bg-black/80 px-4 py-2 text-sm text-white shadow-xl backdrop-blur-md">
      {lastAction}
    </div>
  );
}

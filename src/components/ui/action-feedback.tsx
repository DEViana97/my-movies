"use client";

import { useEffect } from "react";
import { useMovieUIStore } from "@/store/use-movie-ui-store";

export function ActionFeedback() {
  const toast = useMovieUIStore((state) => state.lastAction);
  const clearToast = useMovieUIStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => clearToast(), 2200);
    return () => clearTimeout(timeout);
  }, [toast, clearToast]);

  if (!toast) return null;

  const baseClass = "fixed bottom-5 right-5 z-[999] rounded-md px-4 py-2 text-sm text-white shadow-xl backdrop-blur-md";
  const variantClass =
    toast.type === "error"
      ? "border border-red-400/40 bg-red-950/80"
      : toast.type === "success"
        ? "border border-emerald-400/30 bg-emerald-900/70"
        : "border border-white/20 bg-black/80";

  return (
    <div className={`${baseClass} ${variantClass}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildTmdbImage(path?: string | null, size: "w342" | "w500" | "w780" = "w500") {
  if (!path) return "/placeholder-poster.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function getYear(date?: string) {
  if (!date) return "-";
  return new Date(date).getFullYear().toString();
}

"use client";

import { create } from "zustand";

type MovieUIState = {
  lastAction: string | null;
  setLastAction: (value: string | null) => void;
};

export const useMovieUIStore = create<MovieUIState>((set) => ({
  lastAction: null,
  setLastAction: (value) => set({ lastAction: value }),
}));

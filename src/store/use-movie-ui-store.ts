"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

type ToastMessage = {
  message: string;
  type: ToastType;
};

type MovieUIState = {
  lastAction: ToastMessage | null;
  setLastAction: (value: string | null) => void;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
};

export const useMovieUIStore = create<MovieUIState>((set) => ({
  lastAction: null,
  setLastAction: (value) => set({ lastAction: value ? { message: value, type: "success" } : null }),
  showToast: (message, type = "info") => set({ lastAction: { message, type } }),
  clearToast: () => set({ lastAction: null }),
}));

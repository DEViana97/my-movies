"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

const options = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Automático", icon: Monitor },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9 rounded-full border border-black/[0.1] bg-black/[0.05] dark:border-white/10 dark:bg-white/5" />;
  }

  const current = options.find((o) => o.value === theme) ?? options[2];
  const Icon = current.icon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Alterar tema"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.1] bg-black/[0.05] text-foreground/60 transition hover:border-black/20 hover:bg-black/[0.08] hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:border-white/30 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <Icon size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-xl border border-black/[0.1] bg-background shadow-xl dark:border-white/10">
          {options.map(({ value, label, icon: Opt }) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm transition hover:bg-black/[0.05] dark:hover:bg-white/10 ${theme === value ? "text-(--accent) font-semibold" : "text-foreground/70 dark:text-white/80"
                }`}
            >
              <Opt size={15} />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

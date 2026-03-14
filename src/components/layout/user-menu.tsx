"use client";

import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type UserMenuProps = {
  name?: string | null;
  username?: string | null;
  image?: string | null;
};

export function UserMenu({ name, username, image }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackInitial = (username?.trim()?.[0] ?? "U").toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex w-fit self-start items-center gap-3 lg:self-auto">
      <div className="hidden text-right md:block">
        <p className="text-sm font-semibold text-foreground">{name ?? username ?? "Usuário"}</p>
        <p className="text-xs text-foreground/55">Sessão ativa</p>
      </div>

      <button
        type="button"
        className="h-9 w-9 overflow-hidden rounded-full border border-black/[0.12] transition hover:border-black/[0.3] dark:border-white/20 dark:hover:border-white/45"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menu do usuario"
        onClick={() => setOpen((prev) => !prev)}
      >
        {image ? (
          <Image src={image} alt={name ?? "Perfil"} width={36} height={36} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-foreground/10 text-xs font-bold text-foreground">{fallbackInitial}</div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-11 z-50 w-40 max-w-[calc(100vw-2rem)] rounded-xl border border-black/[0.08] bg-background p-1 shadow-2xl backdrop-blur dark:border-white/15 dark:bg-black/90 md:left-auto md:right-0"
        >
          <Link href="/profile" className="flex h-8 items-center gap-2 rounded-md px-3 text-sm text-foreground hover:bg-black/[0.06] dark:text-white dark:hover:bg-white/10" onClick={() => setOpen(false)}>
            <User size={16} />
            Perfil
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-foreground hover:bg-black/[0.06] dark:text-white dark:hover:bg-white/10"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut size={16} />
            Sair
          </Button>
        </div>
      )}
    </div>
  );
}

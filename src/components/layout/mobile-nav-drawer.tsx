"use client";

import { LogOut, Menu, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { GlobalSearch } from "@/components/layout/global-search";

type NavItem = {
  href: string;
  label: string;
};

type MobileNavDrawerProps = {
  navItems: NavItem[];
  user: {
    name?: string | null;
    username?: string | null;
    image?: string | null;
  };
};

export function MobileNavDrawer({ navItems, user }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const initial = (user.username?.trim()?.[0] ?? "U").toUpperCase();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-md border border-black/[0.12] bg-black/[0.04] text-foreground transition hover:bg-black/[0.08] dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 lg:hidden"
        aria-label="Abrir menu"
        onClick={() => setOpen(true)}
      >
        <Menu size={18} />
      </button>

      <div
        className={`fixed inset-0 z-[60] bg-black/55 transition-opacity duration-200 lg:hidden ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-screen w-[86vw] max-w-sm flex-col border-l border-black/[0.08] bg-background p-4 shadow-2xl transition-transform duration-300 dark:border-white/15 dark:bg-[#07111d] lg:hidden ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between">
          <p className="text-xl font-black tracking-tight text-[var(--accent)]">CineVault</p>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md border border-black/[0.12] text-foreground/80 transition hover:bg-black/[0.06] dark:border-white/20 dark:text-white/90 dark:hover:bg-white/10"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <Link
          href="/profile"
          onClick={() => setOpen(false)}
          className={`relative mt-4 flex items-center gap-3 overflow-hidden rounded-xl border p-3 transition ${pathname === "/profile" ? "border-(--accent)/60 bg-(--accent)/15" : "border-black/[0.08] bg-black/[0.04] hover:bg-black/[0.08] dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"}`}
        >
          {pathname === "/profile" ? <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r bg-[var(--accent)]" /> : null}
          <div className="h-10 w-10 overflow-hidden rounded-full border border-black/[0.12] bg-foreground/[0.06] dark:border-white/20 dark:bg-white/10">
            {user.image ? (
              <Image src={user.image} alt={user.name ?? "Perfil"} width={40} height={40} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-sm font-bold text-foreground">{initial}</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.name ?? user.username ?? "Usuário"}</p>
            <p className="inline-flex items-center gap-1 text-xs text-foreground/60">
              <User size={12} />
              Perfil
            </p>
          </div>
        </Link>

        <div className="mt-4">
          <GlobalSearch />
        </div>

        <nav className="mt-4 flex flex-col gap-1 text-sm text-foreground/80">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`relative overflow-hidden rounded-md py-2 pl-5 pr-3 transition hover:text-foreground dark:hover:text-white ${pathname === item.href ? "bg-(--accent)/20 text-foreground dark:text-white" : "hover:bg-black/[0.06] dark:hover:bg-white/10"}`}
            >
              {pathname === item.href ? <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-[var(--accent)]" /> : null}
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-md border border-black/[0.1] bg-black/[0.04] text-sm font-semibold text-foreground transition hover:bg-black/[0.08] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={16} />
          Sair
        </button>
      </aside>
    </>
  );
}
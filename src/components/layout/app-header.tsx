import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GlobalSearch } from "@/components/layout/global-search";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { UserMenu } from "@/components/layout/user-menu";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/favorites", label: "Favoritos" },
  { href: "/watch-later", label: "Assistir depois" },
  { href: "/watched", label: "Assistidos" },
  { href: "/profile", label: "Perfil" },
];

export async function AppHeader() {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  const user = {
    name: session.user.name,
    username: session.user.username,
    image: session.user.image,
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[var(--background)]/80 backdrop-blur-xl dark:border-white/10">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-2xl font-black tracking-tight text-(--accent)">
          CineVault
        </Link>

        {/* Desktop nav — left of search */}
        <nav className="hidden items-center gap-1 text-sm lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-foreground/70 transition hover:bg-black/5 hover:text-foreground dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile drawer */}
          <MobileNavDrawer navItems={navItems} user={user} />

          {/* Desktop search */}
          <div className="hidden lg:block">
            <GlobalSearch />
          </div>

          {/* Theme switcher (always visible) */}
          <ThemeSwitcher />

          {/* Desktop user menu */}
          <div className="hidden lg:block">
            <UserMenu name={user.name} username={user.username} image={user.image} />
          </div>
        </div>
      </div>
    </header>
  );
}

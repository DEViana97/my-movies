import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GlobalSearch } from "@/components/layout/global-search";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { NavLinks } from "@/components/layout/nav-links";
import { UserMenu } from "@/components/layout/user-menu";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/favorites", label: "Favoritos" },
  { href: "/watch-later", label: "Assistir depois" },
  { href: "/watched", label: "Assistidos" },
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-2xl font-black tracking-tight text-[var(--accent)]">
          CineDEViana
        </Link>

        {/* Desktop nav — left of search */}
        <NavLinks items={navItems} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          <MobileNavDrawer navItems={navItems} user={user} />

          <div className="hidden lg:block">
            <GlobalSearch />
          </div>

          <div className="hidden lg:block">
            <UserMenu name={user.name} username={user.username} image={user.image} />
          </div>
        </div>
      </div>
    </header>
  );
}

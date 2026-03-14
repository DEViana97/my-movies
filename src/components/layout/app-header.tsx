import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GlobalSearch } from "@/components/layout/global-search";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="text-2xl font-black tracking-tight text-[var(--accent)]">
            CineVault
          </Link>

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

        <nav className="mt-3 hidden items-center gap-3 text-sm text-white/80 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2 py-1 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

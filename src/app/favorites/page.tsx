import { ListType } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { UserListGrid } from "@/components/movie/user-list-grid";
import { requireAuth } from "@/lib/auth";
import { getUserListItems } from "@/services/user-lists";

export default async function FavoritesPage() {
  const session = await requireAuth();
  const items = await getUserListItems(session.user.id, ListType.FAVORITE);

  return (
    <AppShell user={{ name: session.user.name, username: session.user.username, image: session.user.image }}>
      <section className="space-y-4 reveal">
        <h1 className="text-4xl font-black">Favoritos</h1>
        <p className="text-sm text-white/70">Sua curadoria pessoal dos melhores títulos.</p>
        <UserListGrid items={items} />
      </section>
    </AppShell>
  );
}

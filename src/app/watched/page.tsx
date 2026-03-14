import { ListType } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { UserListGrid } from "@/components/movie/user-list-grid";
import { requireAuth } from "@/lib/auth";
import { getUserListItems } from "@/services/user-lists";

export default async function WatchedPage() {
  const session = await requireAuth();
  const items = await getUserListItems(session.user.id, ListType.WATCHED);

  return (
    <AppShell user={{ name: session.user.name, username: session.user.username, image: session.user.image }}>
      <section className="space-y-4 reveal">
        <h1 className="text-4xl font-black">Assistidos</h1>
        <p className="text-sm text-white/70">Seu histórico de títulos já concluídos.</p>
        <UserListGrid items={items} />
      </section>
    </AppShell>
  );
}

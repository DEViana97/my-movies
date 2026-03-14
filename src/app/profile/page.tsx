import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      username: true,
      email: true,
      image: true,
    },
  });

  return (
    <AppShell user={{ name: user?.name ?? session.user.name, username: user?.username ?? session.user.username, image: user?.image ?? session.user.image }}>
      <div className="reveal">
        <ProfileForm
          initial={{
            username: user?.username ?? session.user.username ?? "",
            email: user?.email ?? session.user.email ?? "",
            image: user?.image ?? session.user.image,
          }}
        />
      </div>
    </AppShell>
  );
}
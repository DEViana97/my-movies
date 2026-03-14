import { Heart, BookmarkCheck, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/profile/profile-form";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const session = await requireAuth();

  const [user, listCounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        username: true,
        email: true,
        image: true,
      },
    }),
    prisma.userListItem.groupBy({
      by: ["listType"],
      where: { userId: session.user.id },
      _count: { _all: true },
    }),
  ]);

  const countByType = Object.fromEntries(listCounts.map((r) => [r.listType, r._count._all]));

  const stats = [
    {
      label: "Favoritos",
      value: countByType["FAVORITE"] ?? 0,
      icon: Heart,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
    {
      label: "Assistir depois",
      value: countByType["WATCH_LATER"] ?? 0,
      icon: BookmarkCheck,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      border: "border-sky-500/20",
    },
    {
      label: "Assistidos",
      value: countByType["WATCHED"] ?? 0,
      icon: Eye,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <AppShell>
      <div className="reveal space-y-6">
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-2 rounded-2xl border ${border} ${bg} p-4 md:p-5 text-center`}
            >
              <div className={`rounded-full ${bg} p-2`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <span className="text-2xl font-black md:text-3xl">{value}</span>
              <span className="text-xs font-medium text-white/60 md:text-sm">{label}</span>
            </div>
          ))}
        </div>

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
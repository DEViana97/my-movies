import { ListType, type MediaType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { moveToWatched, removeUserListItem, upsertUserListItem } from "@/services/user-lists";

const baseSchema = z.object({
  tmdbId: z.number(),
  mediaType: z.enum(["movie", "tv"]),
  title: z.string().min(1),
  overview: z.string().optional(),
  posterPath: z.string().optional(),
  voteAverage: z.number().optional(),
  releaseDate: z.string().optional(),
});

const saveSchema = z.object({
  listType: z.nativeEnum(ListType),
}).merge(baseSchema);

const removeSchema = z.object({
  listType: z.nativeEnum(ListType),
  tmdbId: z.number(),
  mediaType: z.enum(["movie", "tv"]),
});

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = saveSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const { listType, ...payload } = parsed.data;

  if (listType === ListType.WATCHED) {
    await moveToWatched(userId, {
      ...payload,
      mediaType: payload.mediaType as MediaType,
    });
    return NextResponse.json({ success: true });
  }

  await upsertUserListItem(userId, listType, {
    ...payload,
    mediaType: payload.mediaType as MediaType,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = removeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  await removeUserListItem(userId, parsed.data.listType, parsed.data.tmdbId, parsed.data.mediaType as MediaType);
  return NextResponse.json({ success: true });
}

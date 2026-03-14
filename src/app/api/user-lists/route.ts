import { ListType, type MediaType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { apiError, apiOk } from "@/lib/api-response";
import { authOptions } from "@/lib/auth";
import { checkRateLimit, getRequestIp } from "@/lib/rate-limit";
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
  const limiter = checkRateLimit(`user-lists-post:${getRequestIp(req)}`, {
    windowMs: 5 * 60 * 1000,
    limit: 120,
  });

  if (!limiter.allowed) {
    return apiError(429, "RATE_LIMITED", "Muitas acoes em pouco tempo. Tente novamente em instantes.", {
      retryAfterSeconds: limiter.retryAfterSeconds,
    });
  }

  const userId = await getSessionUserId();
  if (!userId) return apiError(401, "UNAUTHORIZED", "Unauthorized");

  const parsed = saveSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", "Invalid payload", parsed.error.flatten());
  }

  const { listType, ...payload } = parsed.data;

  if (listType === ListType.WATCHED) {
    await moveToWatched(userId, {
      ...payload,
      mediaType: payload.mediaType as MediaType,
    });
    return apiOk({ success: true });
  }

  await upsertUserListItem(userId, listType, {
    ...payload,
    mediaType: payload.mediaType as MediaType,
  });

  return apiOk({ success: true });
}

export async function DELETE(req: Request) {
  const limiter = checkRateLimit(`user-lists-delete:${getRequestIp(req)}`, {
    windowMs: 5 * 60 * 1000,
    limit: 120,
  });

  if (!limiter.allowed) {
    return apiError(429, "RATE_LIMITED", "Muitas acoes em pouco tempo. Tente novamente em instantes.", {
      retryAfterSeconds: limiter.retryAfterSeconds,
    });
  }

  const userId = await getSessionUserId();
  if (!userId) return apiError(401, "UNAUTHORIZED", "Unauthorized");

  const parsed = removeSchema.safeParse(await req.json());
  if (!parsed.success) {
    return apiError(400, "VALIDATION_ERROR", "Invalid payload", parsed.error.flatten());
  }

  await removeUserListItem(userId, parsed.data.listType, parsed.data.tmdbId, parsed.data.mediaType as MediaType);
  return apiOk({ success: true });
}

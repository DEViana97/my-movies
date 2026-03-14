import { ListType, type MediaType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PersistedMediaPayload = {
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  overview?: string;
  posterPath?: string;
  voteAverage?: number;
  releaseDate?: string;
};

export async function upsertUserListItem(userId: string, listType: ListType, payload: PersistedMediaPayload) {
  return prisma.userListItem.upsert({
    where: {
      userId_tmdbId_mediaType_listType: {
        userId,
        tmdbId: payload.tmdbId,
        mediaType: payload.mediaType,
        listType,
      },
    },
    update: {
      title: payload.title,
      overview: payload.overview,
      posterPath: payload.posterPath,
      voteAverage: payload.voteAverage,
      releaseDate: payload.releaseDate,
    },
    create: {
      userId,
      tmdbId: payload.tmdbId,
      mediaType: payload.mediaType,
      listType,
      title: payload.title,
      overview: payload.overview,
      posterPath: payload.posterPath,
      voteAverage: payload.voteAverage,
      releaseDate: payload.releaseDate,
    },
  });
}

export async function removeUserListItem(userId: string, listType: ListType, tmdbId: number, mediaType: MediaType) {
  return prisma.userListItem.deleteMany({
    where: {
      userId,
      listType,
      tmdbId,
      mediaType,
    },
  });
}

export async function moveToWatched(userId: string, payload: PersistedMediaPayload) {
  await prisma.userListItem.deleteMany({
    where: {
      userId,
      tmdbId: payload.tmdbId,
      mediaType: payload.mediaType,
      listType: ListType.WATCH_LATER,
    },
  });

  await upsertUserListItem(userId, ListType.WATCHED, payload);
}

export async function getUserListItems(userId: string, listType: ListType) {
  return prisma.userListItem.findMany({
    where: {
      userId,
      listType,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getUserListStatus(userId: string, tmdbIds: number[]) {
  if (!tmdbIds.length) return { favoriteIds: new Set<number>(), watchLaterIds: new Set<number>(), watchedIds: new Set<number>() };

  const items = await prisma.userListItem.findMany({
    where: {
      userId,
      tmdbId: {
        in: tmdbIds,
      },
    },
    select: {
      tmdbId: true,
      listType: true,
    },
  });

  const favoriteIds = new Set<number>();
  const watchLaterIds = new Set<number>();
  const watchedIds = new Set<number>();

  for (const item of items) {
    if (item.listType === ListType.FAVORITE) favoriteIds.add(item.tmdbId);
    if (item.listType === ListType.WATCH_LATER) watchLaterIds.add(item.tmdbId);
    if (item.listType === ListType.WATCHED) watchedIds.add(item.tmdbId);
  }

  return {
    favoriteIds,
    watchLaterIds,
    watchedIds,
  };
}

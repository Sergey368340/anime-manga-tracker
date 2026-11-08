import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AnimeStatus,
  Prisma,
  AnimeType,
  MangaStatus,
  MangaType,
} from '@prisma/client';

const DEFAULT_IMAGE =
  'https://shikimori.io/uploads/poster/animes/21/main_alt-9d7fe9112ad6c58d10071b9829ef17bc.jpeg';

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  private parseUser(auth: string) {
    const userId = Number(auth);
    if (!userId) return null;
    return userId;
  }

  async getUserAnimeList(
    auth: string,
    filters?: {
      status?: string;
      type?: string;
      sort?: string;
    },
  ) {
    const userId = this.parseUser(auth);

    if (!userId) {
      return { redirect: '/' };
    }

    const where: Prisma.AnimeListEntryWhereInput = {
      userId,
    };

    if (filters?.status) {
      where.status = filters.status as AnimeStatus;
    }

    if (filters?.type) {
      where.anime = {
        is: {
          type: filters.type as AnimeType,
        },
      };
    }

    let orderBy: Prisma.AnimeListEntryOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    switch (filters?.sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'title_asc':
        orderBy = { anime: { title: 'asc' } };
        break;
      case 'title_desc':
        orderBy = { anime: { title: 'desc' } };
        break;
      case 'score_desc':
        orderBy = { score: 'desc' };
        break;
      case 'score_asc':
        orderBy = { score: 'asc' };
        break;
      case 'progress_desc':
        orderBy = { progressEpisodes: 'desc' };
        break;
      case 'progress_asc':
        orderBy = { progressEpisodes: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const list = await this.prisma.animeListEntry.findMany({
      where,
      include: { anime: true },
      orderBy,
    });

    const mapped = list.map((entry) => ({
      ...entry,
      anime: {
        ...entry.anime,
        smallImage: entry.anime.coverImageUrl || DEFAULT_IMAGE,
      },
    }));

    return {
      list: mapped,
      filters: {
        status: filters?.status || '',
        type: filters?.type || '',
        sort: filters?.sort || '',
      },
      authQuery: `?auth=${userId}`,
      title: 'Мой список аниме',
    };
  }

  async addToAnimeList(auth: string, animeIdRaw: string) {
    const userId = this.parseUser(auth);
    const animeId = Number(animeIdRaw);

    if (!userId) {
      return `/anime/${animeId}?auth=0`;
    }

    await this.prisma.animeListEntry.upsert({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      update: {},
      create: {
        userId,
        animeId,
        status: 'PLAN_TO_WATCH',
      },
    });

    return `/lists/anime?auth=${auth}`;
  }

  async updateAnimeEntry(
    auth: string,
    animeIdRaw: string,
    body: {
      status?: string;
      progressEpisodes?: string;
      score?: string;
      notes?: string;
    },
  ) {
    const userId = this.parseUser(auth);
    const animeId = Number(animeIdRaw);

    if (!userId) {
      return '/lists/anime?auth=0';
    }

    const anime = await this.prisma.anime.findUnique({
      where: { id: animeId },
    });

    const maxEpisodes = anime?.episodes ?? 0;

    const progress = body.progressEpisodes
      ? Math.max(0, Math.min(Number(body.progressEpisodes), maxEpisodes))
      : undefined;

    const status = body.status as AnimeStatus;

    await this.prisma.animeListEntry.update({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      data: {
        status,
        progressEpisodes: progress,
        score: body.score ? Number(body.score) : null,
        notes: body.notes || null,
      },
    });

    await this.recalculateAnimeRating(animeId);

    return `/lists/anime?auth=${auth}`;
  }

  async getAnimeEditPage(auth: string, animeIdRaw: string) {
    const userId = this.parseUser(auth);
    const animeId = Number(animeIdRaw);

    if (!userId) {
      return { redirect: '/anime?auth=0' };
    }

    const entry = await this.prisma.animeListEntry.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
      include: { anime: true },
    });

    if (!entry) {
      return {
        redirect: `/anime/${animeId}?auth=${auth}`,
      };
    }

    return {
      entry,
      authQuery: `?auth=${auth}`,
      title: 'Редактировать запись',
    };
  }

  private async recalculateAnimeRating(animeId: number) {
    const entries = await this.prisma.animeListEntry.findMany({
      where: {
        animeId,
        score: {
          not: null,
        },
      },
      select: {
        score: true,
      },
    });

    if (entries.length === 0) {
      await this.prisma.anime.update({
        where: { id: animeId },
        data: { rating: null },
      });
      return;
    }

    const sum = entries.reduce((acc, entry) => acc + (entry.score ?? 0), 0);
    const avg = sum / entries.length;

    await this.prisma.anime.update({
      where: { id: animeId },
      data: {
        rating: Number(avg.toFixed(2)),
      },
    });
  }

  async deleteAnimeEntry(auth: string, animeIdRaw: string) {
    const userId = this.parseUser(auth);
    const animeId = Number(animeIdRaw);

    if (!userId) {
      return '/anime?auth=0';
    }

    const entry = await this.prisma.animeListEntry.findUnique({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
    });

    if (!entry) {
      return `/lists/anime?auth=${auth}`;
    }

    await this.prisma.animeListEntry.delete({
      where: {
        userId_animeId: {
          userId,
          animeId,
        },
      },
    });

    await this.recalculateAnimeRating(animeId);

    return `/lists/anime?auth=${auth}`;
  }

  async getUserMangaList(
    auth: string,
    filters?: {
      status?: string;
      type?: string;
      sort?: string;
    },
  ) {
    const userId = this.parseUser(auth);

    if (!userId) {
      return { redirect: '/' };
    }

    const where: Prisma.MangaListEntryWhereInput = {
      userId,
    };

    if (filters?.status) {
      where.status = filters.status as MangaStatus;
    }

    if (filters?.type) {
      where.manga = {
        is: {
          type: filters.type as MangaType,
        },
      };
    }

    let orderBy: Prisma.MangaListEntryOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    switch (filters?.sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'title_asc':
        orderBy = { manga: { title: 'asc' } };
        break;
      case 'title_desc':
        orderBy = { manga: { title: 'desc' } };
        break;
      case 'score_desc':
        orderBy = { score: 'desc' };
        break;
      case 'score_asc':
        orderBy = { score: 'asc' };
        break;
      case 'progress_desc':
        orderBy = { progressChapters: 'desc' };
        break;
      case 'progress_asc':
        orderBy = { progressChapters: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const list = await this.prisma.mangaListEntry.findMany({
      where,
      include: { manga: true },
      orderBy,
    });

    const mapped = list.map((entry) => ({
      ...entry,
      manga: {
        ...entry.manga,
        smallImage: entry.manga.coverImageUrl || DEFAULT_IMAGE,
      },
    }));

    return {
      list: mapped,
      filters: {
        status: filters?.status || '',
        type: filters?.type || '',
        sort: filters?.sort || '',
      },
      authQuery: `?auth=${userId}`,
      title: 'Мой список манги',
    };
  }

  async addToMangaList(auth: string, mangaIdRaw: string) {
    const userId = this.parseUser(auth);
    const mangaId = Number(mangaIdRaw);

    if (!userId) {
      return `/manga/${mangaId}?auth=0`;
    }

    await this.prisma.mangaListEntry.upsert({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
      update: {},
      create: {
        userId,
        mangaId,
        status: 'PLAN_TO_READ',
      },
    });

    return `/lists/manga?auth=${auth}`;
  }

  async updateMangaEntry(
    auth: string,
    mangaIdRaw: string,
    body: {
      status?: string;
      progressChapters?: string;
      progressVolumes?: string;
      score?: string;
      notes?: string;
    },
  ) {
    const userId = this.parseUser(auth);
    const mangaId = Number(mangaIdRaw);

    if (!userId) {
      return '/lists/manga?auth=0';
    }

    const manga = await this.prisma.manga.findUnique({
      where: { id: mangaId },
    });

    const maxChapters = manga?.chapters ?? 0;
    const maxVolumes = manga?.volumes ?? 0;

    const progressChapters = body.progressChapters
      ? Math.max(0, Math.min(Number(body.progressChapters), maxChapters))
      : undefined;

    const progressVolumes = body.progressVolumes
      ? Math.max(0, Math.min(Number(body.progressVolumes), maxVolumes))
      : undefined;

    const status = body.status as MangaStatus;

    await this.prisma.mangaListEntry.update({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
      data: {
        status,
        progressChapters,
        progressVolumes,
        score: body.score ? Number(body.score) : null,
        notes: body.notes || null,
      },
    });

    await this.recalculateMangaRating(mangaId);

    return `/lists/manga?auth=${auth}`;
  }

  async getMangaEditPage(auth: string, mangaIdRaw: string) {
    const userId = this.parseUser(auth);
    const mangaId = Number(mangaIdRaw);

    if (!userId) {
      return { redirect: '/manga?auth=0' };
    }

    const entry = await this.prisma.mangaListEntry.findUnique({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
      include: { manga: true },
    });

    if (!entry) {
      return {
        redirect: `/manga/${mangaId}?auth=${auth}`,
      };
    }

    return {
      entry,
      authQuery: `?auth=${auth}`,
      title: 'Редактировать запись',
    };
  }

  private async recalculateMangaRating(mangaId: number) {
    const entries = await this.prisma.mangaListEntry.findMany({
      where: {
        mangaId,
        score: {
          not: null,
        },
      },
      select: {
        score: true,
      },
    });

    if (entries.length === 0) {
      await this.prisma.manga.update({
        where: { id: mangaId },
        data: { rating: null },
      });
      return;
    }

    const sum = entries.reduce((acc, entry) => acc + (entry.score ?? 0), 0);
    const avg = sum / entries.length;

    await this.prisma.manga.update({
      where: { id: mangaId },
      data: {
        rating: Number(avg.toFixed(2)),
      },
    });
  }

  async deleteMangaEntry(auth: string, mangaIdRaw: string) {
    const userId = this.parseUser(auth);
    const mangaId = Number(mangaIdRaw);

    if (!userId) {
      return '/manga?auth=0';
    }

    const entry = await this.prisma.mangaListEntry.findUnique({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
    });

    if (!entry) {
      return `/lists/manga?auth=${auth}`;
    }

    await this.prisma.mangaListEntry.delete({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
    });

    await this.recalculateMangaRating(mangaId);

    return `/lists/manga?auth=${auth}`;
  }
}
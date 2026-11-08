import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnimeType, AnimeAiringStatus, Prisma } from '@prisma/client';

const DEFAULT_SMALL =
  'https://cdn.myanimelist.net/r/50x70/images/anime/1141/142503.jpg?s=72e1fc2ba0d30e1607ab15de24dfc5f4';

const DEFAULT_BIG = 'https://myanimelist.net/images/anime/1141/142503.jpg';

@Injectable()
export class AnimeService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    type?: string;
    airingStatus?: string;
    sort?: string;
  }) {
    const where: Prisma.AnimeWhereInput = {};
    let orderBy: Prisma.AnimeOrderByWithRelationInput = { createdAt: 'desc' };

    if (filters?.type) {
      where.type = filters.type as AnimeType;
    }

    if (filters?.airingStatus) {
      where.airingStatus = filters.airingStatus as AnimeAiringStatus;
    }

    switch (filters?.sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'title_asc':
        orderBy = { title: 'asc' };
        break;
      case 'title_desc':
        orderBy = { title: 'desc' };
        break;
      case 'rating_desc':
        orderBy = { rating: 'desc' };
        break;
      case 'rating_asc':
        orderBy = { rating: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const anime = await this.prisma.anime.findMany({
      where,
      orderBy,
    });

    return anime.map((a) => ({
      ...a,
      smallImage: a.coverImageUrl || DEFAULT_SMALL,
    }));
  }

  async findOne(id: number) {
    return this.prisma.anime.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    const anime = await this.prisma.anime.findUnique({
      where: { slug },
    });

    if (!anime) return null;

    return {
      ...anime,
      coverImage: anime.coverImageUrl || DEFAULT_BIG,
    };
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.anime.findUnique({
        where: { slug },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async create(data: {
    title: string;
    description?: string;
    type?: string;
    airingStatus?: string;
    episodes?: string;
    rating?: string;
    startDate?: string;
    endDate?: string;
    coverImageUrl?: string;
  }) {
    const slug = await this.generateUniqueSlug(data.title);

    return this.prisma.anime.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        type: data.type as AnimeType,
        airingStatus: data.airingStatus as AnimeAiringStatus,
        episodes: data.episodes ? Number(data.episodes) : null,
        rating: data.rating ? Number(data.rating) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        coverImageUrl: data.coverImageUrl,
      },
    });
  }

  async update(
    id: number,
    data: {
      title: string;
      description?: string;
      type?: string;
      airingStatus?: string;
      episodes?: string;
      rating?: string;
      startDate?: string;
      endDate?: string;
      coverImageUrl?: string;
    },
  ) {
    return this.prisma.anime.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type as AnimeType,
        airingStatus: data.airingStatus as AnimeAiringStatus,
        episodes: data.episodes ? Number(data.episodes) : null,
        rating: data.rating ? Number(data.rating) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        coverImageUrl: data.coverImageUrl,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.anime.delete({
      where: { id },
    });
  }

  async getUser(auth?: string) {
    if (!auth || auth === '0') return null;

    return this.prisma.user.findUnique({
      where: { id: Number(auth) },
    });
  }
}
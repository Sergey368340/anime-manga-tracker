import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MangaType, MangaPublishingStatus, Prisma } from '@prisma/client';

const DEFAULT_SMALL = 'https://cdn.myanimelist.net/images/manga/1/157897.jpg';

const DEFAULT_BIG = 'https://cdn.myanimelist.net/images/manga/1/157897l.jpg';

@Injectable()
export class MangaService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    type?: string;
    publishingStatus?: string;
    sort?: string;
  }) {
    const where: Prisma.MangaWhereInput = {};
    let orderBy: Prisma.MangaOrderByWithRelationInput = { createdAt: 'desc' };

    if (filters?.type) {
      where.type = filters.type as MangaType;
    }

    if (filters?.publishingStatus) {
      where.publishingStatus =
        filters.publishingStatus as MangaPublishingStatus;
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

    const manga = await this.prisma.manga.findMany({
      where,
      orderBy,
    });

    return manga.map((m) => ({
      ...m,
      smallImage: m.coverImageUrl || DEFAULT_SMALL,
    }));
  }

  async findOne(id: number) {
    return this.prisma.manga.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string) {
    const manga = await this.prisma.manga.findUnique({
      where: { slug },
    });

    if (!manga) return null;

    return {
      ...manga,
      coverImage: manga.coverImageUrl || DEFAULT_BIG,
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
      const existing = await this.prisma.manga.findUnique({
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
    publishingStatus?: string;
    chapters?: string;
    volumes?: string;
    rating?: string;
    startDate?: string;
    endDate?: string;
    coverImageUrl?: string;
  }) {
    const slug = await this.generateUniqueSlug(data.title);

    return this.prisma.manga.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        type: data.type as MangaType,
        publishingStatus: data.publishingStatus as MangaPublishingStatus,
        chapters: data.chapters ? Number(data.chapters) : null,
        volumes: data.volumes ? Number(data.volumes) : null,
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
      publishingStatus?: string;
      chapters?: string;
      volumes?: string;
      rating?: string;
      startDate?: string;
      endDate?: string;
      coverImageUrl?: string;
    },
  ) {
    return this.prisma.manga.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type as MangaType,
        publishingStatus: data.publishingStatus as MangaPublishingStatus,
        chapters: data.chapters ? Number(data.chapters) : null,
        volumes: data.volumes ? Number(data.volumes) : null,
        rating: data.rating ? Number(data.rating) : null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        coverImageUrl: data.coverImageUrl,
      },
    });
  }

  async delete(id: number) {
    return this.prisma.manga.delete({
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

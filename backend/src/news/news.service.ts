import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Subject } from 'rxjs';

const DEFAULT_NEWS_IMAGE =
  'https://cdn.myanimelist.net/r/50x70/images/anime/1141/142503.jpg?s=72e1fc2ba0d30e1607ab15de24dfc5f4';

type NewsEvent = {
  type: 'created' | 'updated' | 'deleted';
  news: {
    id: number;
    title: string;
    slug: string;
  };
};

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}

  private newsStream = new Subject<NewsEvent>();

  getNewsStream() {
    return this.newsStream.asObservable();
  }

  async findAll() {
    const news = await this.prisma.news.findMany({
      orderBy: { publishedAt: 'desc' },
    });

    return news.map((n) => ({
      ...n,
      imageUrl: n.imageUrl || DEFAULT_NEWS_IMAGE,
    }));
  }

  async findOne(slug: string) {
    const n = await this.prisma.news.findUnique({
      where: { slug },
    });

    if (!n) return null;

    return {
      ...n,
      imageUrl: n.imageUrl || DEFAULT_NEWS_IMAGE,
    };
  }

  async create(data: {
    title: string;
    content: string;
    imageUrl?: string;
    publishedAt: string;
  }) {
    const news = await this.prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || DEFAULT_NEWS_IMAGE,
        slug: data.title.toLowerCase().replace(/\s+/g, '-'),
        publishedAt: new Date(data.publishedAt),
      },
    });

    this.newsStream.next({
      type: 'created',
      news,
    });

    return news;
  }

  async update(
    slug: string,
    data: {
      title: string;
      content: string;
      imageUrl?: string;
      publishedAt: string;
    },
  ) {
    const news = await this.prisma.news.update({
      where: { slug },
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || DEFAULT_NEWS_IMAGE,
        publishedAt: new Date(data.publishedAt),
      },
    });

    this.newsStream.next({
      type: 'updated',
      news,
    });

    return news;
  }

  async delete(slug: string) {
    const news = await this.prisma.news.delete({
      where: { slug },
    });

    this.newsStream.next({
      type: 'deleted',
      news,
    });

    return news;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewTargetType, ReviewRecommendation } from '@prisma/client';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getByAnime(animeId: number) {
    return this.prisma.review.findMany({
      where: {
        targetType: 'ANIME',
        targetId: animeId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getByManga(mangaId: number) {
    return this.prisma.review.findMany({
      where: {
        targetType: 'MANGA',
        targetId: mangaId,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createFromRequest(
    body: {
      targetType: string;
      targetId: string;
      content: string;
      recommendation: string;
    },
    auth: string,
  ) {
    if (!auth || auth === '0') {
      return null;
    }

    const userId = Number(auth);

    return this.prisma.review.create({
      data: {
        userId,
        targetType: body.targetType as ReviewTargetType,
        targetId: Number(body.targetId),
        content: body.content,
        recommendation: body.recommendation as ReviewRecommendation,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.review.findUnique({
      where: { id },
    });
  }

  async deleteWithAccessCheckFromRequest(id: string, auth: string) {
    const userId = Number(auth);

    return this.deleteWithAccessCheck(Number(id), userId);
  }

  async deleteWithAccessCheck(reviewId: number, userId: number) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) return null;

    const isOwner = review.userId === userId;
    const isAdmin = userId === 1;

    if (!isOwner && !isAdmin) {
      return null;
    }

    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return review;
  }
}

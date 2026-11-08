import { Controller, Post, Body, Res, Query, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import type { Response } from 'express';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(
    @Body()
    body: {
      targetType: string;
      targetId: string;
      content: string;
      recommendation: string;
      slug?: string;
    },
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const result = await this.reviewsService.createFromRequest(body, auth);

    const entityType = body.targetType === 'MANGA' ? 'manga' : 'anime';
    const fallbackPath = body.slug
      ? `/${entityType}/${body.slug}`
      : `/${entityType}`;

    if (!result) {
      return res.redirect(fallbackPath);
    }

    return res.redirect(`${fallbackPath}?auth=${auth}`);
  }

  @Post(':id/delete')
  async delete(
    @Param('id') id: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const review = await this.reviewsService.deleteWithAccessCheckFromRequest(
      id,
      auth,
    );

    if (!review) {
      return res.redirect('/anime');
    }

    const entityPath = review.targetType === 'MANGA' ? 'manga' : 'anime';

    return res.redirect(`/${entityPath}?auth=${auth}`);
  }
}

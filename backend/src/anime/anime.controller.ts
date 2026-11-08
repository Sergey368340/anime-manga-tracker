import { Controller, Get, Param, Post, Body, Res, Query } from '@nestjs/common';
import { AnimeService } from './anime.service';
import { ReviewsService } from '../reviews/reviews.service';
import type { Response } from 'express';

@Controller('anime')
export class AnimeController {
  constructor(
    private readonly animeService: AnimeService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  async getAll(
    @Query('type') type: string,
    @Query('airingStatus') airingStatus: string,
    @Query('sort') sort: string,
    @Res() res: Response,
  ) {
    const anime = await this.animeService.findAll({
      type,
      airingStatus,
      sort,
    });

    return res.render('anime/index', {
      anime,
      title: 'Каталог аниме',
      filters: {
        type: type || '',
        airingStatus: airingStatus || '',
        sort: sort || '',
      },
    });
  }

  @Get('add')
  getAddPage(@Query('auth') auth: string, @Res() res: Response) {
    const authQuery = auth ? `?auth=${auth}` : '?auth=0';

    return res.render('anime/add', {
      authQuery,
      title: 'Добавить аниме',
    });
  }

  @Post()
  async create(
    @Body() body: any,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.animeService.create(body);

    return res.redirect(`/anime?auth=${auth || 0}`);
  }

  @Get(':id/edit')
  async getEditPage(
    @Param('id') id: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const anime = await this.animeService.findOne(Number(id));

    const authQuery = auth ? `?auth=${auth}` : '?auth=0';

    return res.render('anime/edit', {
      anime,
      authQuery,
      title: `Редактировать ${anime?.title}`,
    });
  }

  @Post(':id/edit')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.animeService.update(Number(id), body);

    return res.redirect(`/anime/${id}?auth=${auth || 0}`);
  }

  @Post(':id/delete')
  async delete(
    @Param('id') id: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.animeService.delete(Number(id));

    return res.redirect(`/anime?auth=${auth || 0}`);
  }

  @Get(':slug')
  async getOne(
    @Param('slug') slug: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const anime = await this.animeService.findBySlug(slug);

    if (!anime) {
      return res.redirect('/anime');
    }

    const reviews = await this.reviewsService.getByAnime(anime.id);
    const user = await this.animeService.getUser(auth);

    const authQuery = auth ? `?auth=${auth}` : '?auth=0';

    return res.render('anime/show', {
      anime,
      reviews,
      user,
      auth,
      authQuery,
      title: anime.title,
    });
  }
}

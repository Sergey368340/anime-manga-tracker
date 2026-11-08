import { Controller, Get, Param, Post, Body, Res, Query } from '@nestjs/common';
import { MangaService } from './manga.service';
import { ReviewsService } from '../reviews/reviews.service';
import type { Response } from 'express';

@Controller('manga')
export class MangaController {
  constructor(
    private readonly mangaService: MangaService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  async getAll(
    @Query('type') type: string,
    @Query('publishingStatus') publishingStatus: string,
    @Query('sort') sort: string,
    @Res() res: Response,
  ) {
    const manga = await this.mangaService.findAll({
      type,
      publishingStatus,
      sort,
    });

    return res.render('manga/index', {
      manga,
      title: 'Каталог манги',
      filters: {
        type: type || '',
        publishingStatus: publishingStatus || '',
        sort: sort || '',
      },
    });
  }

  @Get('add')
  getAddPage(@Query('auth') auth: string, @Res() res: Response) {
    const authQuery = auth ? `?auth=${auth}` : '?auth=0';

    return res.render('manga/add', {
      authQuery,
      title: 'Добавить мангу',
    });
  }

  @Post()
  async create(
    @Body() body: any,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.mangaService.create(body);

    return res.redirect(`/manga?auth=${auth || 0}`);
  }

  @Get(':id/edit')
  async getEditPage(
    @Param('id') id: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const manga = await this.mangaService.findOne(Number(id));

    const authQuery = auth ? `?auth=${auth}` : '?auth=0';

    return res.render('manga/edit', {
      manga,
      authQuery,
      title: `Редактировать ${manga?.title}`,
    });
  }

  @Post(':id/edit')
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.mangaService.update(Number(id), body);

    return res.redirect(`/manga/${id}?auth=${auth || 0}`);
  }

  @Post(':id/delete')
  async delete(
    @Param('id') id: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.mangaService.delete(Number(id));

    return res.redirect(`/manga?auth=${auth || 0}`);
  }

  @Get(':slug')
  async getOne(
    @Param('slug') slug: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const manga = await this.mangaService.findBySlug(slug);

    if (!manga) {
      return res.redirect('/manga');
    }

    const reviews = await this.reviewsService.getByManga(manga.id);
    const user = await this.mangaService.getUser(auth);

    const authQuery = auth ? `?auth=${auth}` : '?auth=0';

    return res.render('manga/show', {
      manga,
      reviews,
      user,
      auth,
      authQuery,
      title: manga.title,
    });
  }
}

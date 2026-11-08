import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Res,
  Query,
  Sse,
} from '@nestjs/common';
import { NewsService } from './news.service';
import type { Response } from 'express';
import { map } from 'rxjs/operators';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  private getAuthQuery(auth?: string) {
    return auth ? `?auth=${auth}` : '?auth=0';
  }

  @Get()
  async getAll(@Query('auth') auth: string, @Res() res: Response) {
    const news = await this.newsService.findAll();

    return res.render('news/index', {
      news,
      authQuery: this.getAuthQuery(auth),
      title: 'Новости',
    });
  }

  @Sse('stream')
  stream() {
    return this.newsService.getNewsStream().pipe(
      map((data) => ({
        id: Date.now().toString(),
        data: JSON.stringify(data),
      })),
    );
  }

  @Get('add')
  getAdd(@Query('auth') auth: string, @Res() res: Response) {
    return res.render('news/add', {
      authQuery: this.getAuthQuery(auth),
      title: 'Добавить новость',
    });
  }

  @Post()
  async create(
    @Body() body: any,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.newsService.create(body);

    return res.redirect(`/news${this.getAuthQuery(auth)}`);
  }

  @Get(':slug')
  async getOne(
    @Param('slug') slug: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const news = await this.newsService.findOne(slug);

    if (!news) return res.redirect('/news');

    return res.render('news/show', {
      news,
      authQuery: this.getAuthQuery(auth),
      title: news.title,
    });
  }

  @Get(':slug/edit')
  async edit(
    @Param('slug') slug: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const news = await this.newsService.findOne(slug);

    return res.render('news/edit', {
      news,
      authQuery: this.getAuthQuery(auth),
      title: 'Редактировать',
    });
  }

  @Post(':slug/edit')
  async update(
    @Param('slug') slug: string,
    @Body() body: any,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.newsService.update(slug, body);

    return res.redirect(`/news/${this.getAuthQuery(auth)}`);
  }

  @Post(':slug/delete')
  async delete(
    @Param('slug') slug: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.newsService.delete(slug);

    return res.redirect(`/news${this.getAuthQuery(auth)}`);
  }
}

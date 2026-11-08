import { Controller, Post, Param, Query, Res, Get, Body } from '@nestjs/common';
import { ListsService } from './lists.service';
import type { Response } from 'express';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get('anime')
  async getAnimeList(
    @Query('auth') auth: string,
    @Query('status') status: string,
    @Query('type') type: string,
    @Query('sort') sort: string,
    @Res() res: Response,
  ) {
    const result = await this.listsService.getUserAnimeList(auth, {
      status,
      type,
      sort,
    });

    if (result.redirect) {
      return res.redirect(result.redirect);
    }

    return res.render('lists/anime', result);
  }

  @Post('anime/:animeId')
  async addAnimeToList(
    @Param('animeId') animeId: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const redirectTo = await this.listsService.addToAnimeList(auth, animeId);
    return res.redirect(redirectTo);
  }

  @Post('anime/:animeId/update')
  async updateAnimeEntry(
    @Param('animeId') animeId: string,
    @Query('auth') auth: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    const redirectTo = await this.listsService.updateAnimeEntry(
      auth,
      animeId,
      body,
    );
    return res.redirect(redirectTo);
  }

  @Get('anime/:animeId/edit')
  async getAnimeEditPage(
    @Param('animeId') animeId: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const result = await this.listsService.getAnimeEditPage(auth, animeId);

    if (result.redirect) {
      return res.redirect(result.redirect);
    }

    return res.render('lists/edit', result);
  }

  @Post('anime/:animeId/delete')
  async deleteAnimeEntry(
    @Param('animeId') animeId: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const redirectTo = await this.listsService.deleteAnimeEntry(auth, animeId);
    return res.redirect(redirectTo);
  }

  @Get('manga')
  async getMangaList(
    @Query('auth') auth: string,
    @Query('status') status: string,
    @Query('type') type: string,
    @Query('sort') sort: string,
    @Res() res: Response,
  ) {
    const result = await this.listsService.getUserMangaList(auth, {
      status,
      type,
      sort,
    });

    if (result.redirect) {
      return res.redirect(result.redirect);
    }

    return res.render('lists/manga', result);
  }

  @Post('manga/:mangaId')
  async addMangaToList(
    @Param('mangaId') mangaId: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const redirectTo = await this.listsService.addToMangaList(auth, mangaId);
    return res.redirect(redirectTo);
  }

  @Post('manga/:mangaId/update')
  async updateMangaEntry(
    @Param('mangaId') mangaId: string,
    @Query('auth') auth: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    const redirectTo = await this.listsService.updateMangaEntry(
      auth,
      mangaId,
      body,
    );
    return res.redirect(redirectTo);
  }

  @Get('manga/:mangaId/edit')
  async getMangaEditPage(
    @Param('mangaId') mangaId: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const result = await this.listsService.getMangaEditPage(auth, mangaId);

    if (result.redirect) {
      return res.redirect(result.redirect);
    }

    return res.render('lists/manga-edit', result);
  }

  @Post('manga/:mangaId/delete')
  async deleteMangaEntry(
    @Param('mangaId') mangaId: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const redirectTo = await this.listsService.deleteMangaEntry(auth, mangaId);
    return res.redirect(redirectTo);
  }
}
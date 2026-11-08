import { Controller, Get, Param, Res, Query, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import type { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('add')
  getAddPage(@Query('auth') auth: string, @Res() res: Response) {
    const authQuery = auth ? `?auth=${auth}` : '?auth=0';

    return res.render('users/add', {
      authQuery,
      title: 'Регистрация',
    });
  }

  @Post()
  async create(
    @Body() body: { username: string; email: string },
    @Res() res: Response,
  ) {
    const user = await this.usersService.create(body);

    return res.redirect(`/users/${user.id}?auth=${user.id}`);
  }

  @Get(':id')
  async getUser(
    @Param('id') id: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const user = await this.usersService.getById(id);

    if (!user) {
      return res.redirect('/anime');
    }

    const authQuery = auth ? `?auth=${auth}` : '?auth=0';

    return res.render('users/show', {
      user,
      auth,
      authQuery,
      title: user.username,
    });
  }

  @Get(':id/edit')
  async edit(
    @Param('id') id: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const user = await this.usersService.getById(id);

    const authQuery = auth ? `?auth=${auth}` : '?auth=0';

    return res.render('users/edit', {
      user,
      authQuery,
      title: 'Редактировать профиль',
    });
  }

  @Post(':id/edit')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      username: string;
      email: string;
      avatarUrl?: string;
      bio?: string;
    },
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    await this.usersService.update(id, body);

    return res.redirect(`/users/${id}?auth=${auth}`);
  }

  @Post(':id/delete')
  async delete(
    @Param('id') id: string,
    @Query('auth') auth: string,
    @Res() res: Response,
  ) {
    const success = await this.usersService.deleteWithCheck(id, auth);

    if (!success) {
      return res.redirect(`/users/${id}?auth=${auth}`);
    }

    return res.redirect('/anime?auth=0');
  }
}

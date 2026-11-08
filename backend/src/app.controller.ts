import { Controller, Get, Query, Render } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  getIndex(@Query('auth') auth?: string) {
    const isAuth = auth === '1';
    const authQuery = isAuth ? '?auth=1' : '?auth=0';
    return {
      title: 'МойАнимеСписок',
      isAuth,
      username: isAuth ? 'Kononov' : null,
      authQuery,
      seasonal: [
        { title: 'Название тайтла 1', img: '/image_1.png' },
        { title: 'Название тайтла 2', img: '/image_1.png' },
        { title: 'Название тайтла 3', img: '/image_1.png' },
      ],

      topAnime: [
        { title: 'Тайтл 1', img: '/image_1.png' },
        { title: 'Тайтл 2', img: '/image_1.png' },
      ],
    };
  }
  @Get('read')
  @Render('read')
  getRead(@Query('auth') auth?: string) {
    const isAuth = auth === '1';
    const authQuery = isAuth ? '?auth=1' : '?auth=0';
    return {
      title: 'МойАнимеСписок',
      isAuth,
      username: isAuth ? 'Kononov' : null,
      authQuery,
    };
  }
  @Get('watch')
  @Render('watch')
  getWatch(@Query('auth') auth?: string) {
    const isAuth = auth === '1';
    const authQuery = isAuth ? '?auth=1' : '?auth=0';
    return {
      title: 'МойАнимеСписок',
      isAuth,
      username: isAuth ? 'Kononov' : null,
      authQuery,
    };
  }
  @Get('about')
  @Render('about')
  getAbout(@Query('auth') auth?: string) {
    const isAuth = auth === '1';
    const authQuery = isAuth ? '?auth=1' : '?auth=0';
    return {
      title: 'МойАнимеСписок',
      isAuth,
      username: isAuth ? 'Kononov' : null,
      authQuery,
    };
  }
  @Get('feedback')
  @Render('feedback')
  getFeedback(@Query('auth') auth?: string) {
    const isAuth = auth === '1';
    const authQuery = isAuth ? '?auth=1' : '?auth=0';

    return {
      title: 'МойАнимеСписок',
      isAuth,
      username: isAuth ? 'Kononov' : null,
      authQuery,
    };
  }
}

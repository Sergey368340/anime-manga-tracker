import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import hbs from 'hbs';
import * as exphbs from 'express-handlebars';
import type { Request, Response, NextFunction } from 'express';
import { PrismaService } from './prisma/prisma.service';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const prisma = app.get(PrismaService);

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    const authParam = req.query.auth;
    const auth =
      typeof authParam === 'string' && authParam.trim() !== ''
        ? authParam
        : '0';

    const isAuth = auth !== '0';

    res.locals.auth = auth;
    res.locals.authQuery = `?auth=${auth}`;
    res.locals.currentPath = req.path;
    res.locals.isAuth = isAuth;
    res.locals.username = null;

    if (isAuth) {
      const userId = Number(auth);

      if (!Number.isNaN(userId)) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { username: true },
        });

        if (user) {
          res.locals.username = user.username;
        } else {
          res.locals.auth = '0';
          res.locals.authQuery = '?auth=0';
          res.locals.isAuth = false;
        }
      } else {
        res.locals.auth = '0';
        res.locals.authQuery = '?auth=0';
        res.locals.isAuth = false;
      }
    }

    next();
  });

  app.useStaticAssets(join(__dirname, '..', '..', 'public'), { index: false });
  console.log('__dirname =', __dirname);
  console.log('views path =', join(__dirname, '..', 'views'));
  app.setBaseViewsDir(join(__dirname, '..', '..', 'views'));

  app.engine(
    'hbs',
    exphbs.engine({
      extname: '.hbs',
      defaultLayout: 'main',
      layoutsDir: join(__dirname, '..', '..', 'views', 'layouts'),
      helpers: {
        eq: (a: unknown, b: unknown) => a === b,
        or: (a: unknown, b: unknown) => Boolean(a || b),
        formatAnimeType: (type: string) => {
          const map: Record<string, string> = {
            TV: 'TV-сериал',
            MOVIE: 'Фильм',
            OVA: 'OVA',
            SPECIAL: 'Спецвыпуск',
            ONA: 'ONA',
            MUSIC: 'Музыкальный клип',
          };

          return map[type] || type;
        },
        inc: (value: unknown) => Number(value) + 1,
        formatAnimeAiringStatus: (status: string) => {
          const map: Record<string, string> = {
            FINISHED_AIRING: 'Завершён',
            CURRENTLY_AIRING: 'Выходит',
            NOT_YET_AIRED: 'Ещё не вышел',
          };

          return map[status] || status;
        },

        formatReviewRecommendation: (recommendation: string) => {
          const map: Record<string, string> = {
            RECOMMENDED: 'Рекомендую',
            MIXED: 'Неоднозначно',
            NOT_RECOMMENDED: 'Не рекомендую',
          };

          return map[recommendation] || recommendation;
        },

        formatMangaType: (type: string) => {
          const map: Record<string, string> = {
            MANGA: 'Манга',
            NOVEL: 'Новелла',
            ONE_SHOT: 'Ваншот',
            DOUJINSHI: 'Додзинси',
            MANHWA: 'Манхва',
            MANHUA: 'Маньхуа',
          };

          return map[type] || type;
        },

        formatMangaPublishingStatus: (status: string) => {
          const map: Record<string, string> = {
            FINISHED: 'Завершена',
            PUBLISHING: 'Публикуется',
            ON_HIATUS: 'На паузе',
            DISCONTINUED: 'Прекращена',
          };

          return map[status] || status;
        },

        formatMangaStatus: (status: string) => {
          const map: Record<string, string> = {
            READING: 'Читаю',
            COMPLETED: 'Прочитано',
            ON_HOLD: 'На паузе',
            DROPPED: 'Брошено',
            PLAN_TO_READ: 'Запланировано',
          };

          return map[status] || status;
        },
        formatAnimeStatus: (status: string) => {
          const map: Record<string, string> = {
            WATCHING: 'Смотрю',
            COMPLETED: 'Просмотрено',
            ON_HOLD: 'На паузе',
            DROPPED: 'Брошено',
            PLAN_TO_WATCH: 'Запланировано',
          };

          return map[status] || status;
        },

        formatDateRu: (date: string | Date | null) => {
          if (!date) return '—';

          const parsedDate = date instanceof Date ? date : new Date(date);

          if (Number.isNaN(parsedDate.getTime())) {
            return '—';
          }

          return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(parsedDate);
        },
      },
    }),
  );

  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', '..', 'views', 'partials'));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  console.log('PORT =', configService.get('PORT'));
  console.log('DATABASE_URL exists =', !!configService.get('DATABASE_URL'));

  await app.listen(port);
  console.log(`${port}`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed', err);
  process.exit(1);
});

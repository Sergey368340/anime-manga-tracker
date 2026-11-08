import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AnimeModule } from './anime/anime.module';
import { MangaModule } from './manga/manga.module';
import { ListsModule } from './lists/lists.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AnimeModule,
    MangaModule,
    ListsModule,
    ReviewsModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

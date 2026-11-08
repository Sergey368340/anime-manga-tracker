import { Module } from '@nestjs/common';
import { ListsService } from './lists.service';
import { ListsController } from './lists.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AnimeModule } from '../anime/anime.module';
import { MangaModule } from '../manga/manga.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, AnimeModule, MangaModule, UsersModule],
  controllers: [ListsController],
  providers: [ListsService],
})
export class ListsModule {}

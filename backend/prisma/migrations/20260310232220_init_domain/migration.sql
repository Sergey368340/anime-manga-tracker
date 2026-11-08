/*
  Warnings:

  - The primary key for the `Anime` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `studioId` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `titleEn` on the `Anime` table. All the data in the column will be lost.
  - You are about to drop the column `titleRu` on the `Anime` table. All the data in the column will be lost.
  - The `id` column on the `Anime` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Studio` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Studio` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AnimeGenre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Genre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Anime` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Studio` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `airingStatus` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Anime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Studio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Studio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AnimeStatus" AS ENUM ('WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH');

-- CreateEnum
CREATE TYPE "MangaStatus" AS ENUM ('READING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_READ');

-- CreateEnum
CREATE TYPE "AnimeType" AS ENUM ('TV', 'MOVIE', 'OVA', 'SPECIAL', 'ONA', 'MUSIC');

-- CreateEnum
CREATE TYPE "MangaType" AS ENUM ('MANGA', 'NOVEL', 'ONE_SHOT', 'DOUJINSHI', 'MANHWA', 'MANHUA');

-- CreateEnum
CREATE TYPE "AnimeAiringStatus" AS ENUM ('FINISHED_AIRING', 'CURRENTLY_AIRING', 'NOT_YET_AIRED');

-- CreateEnum
CREATE TYPE "MangaPublishingStatus" AS ENUM ('FINISHED', 'PUBLISHING', 'ON_HIATUS', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "ReviewRecommendation" AS ENUM ('RECOMMENDED', 'MIXED', 'NOT_RECOMMENDED');

-- DropForeignKey
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_studioId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeGenre" DROP CONSTRAINT "AnimeGenre_animeId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeGenre" DROP CONSTRAINT "AnimeGenre_genreId_fkey";

-- DropForeignKey
ALTER TABLE "ListEntry" DROP CONSTRAINT "ListEntry_animeId_fkey";

-- DropForeignKey
ALTER TABLE "ListEntry" DROP CONSTRAINT "ListEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_animeId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropIndex
DROP INDEX "Anime_titleRu_idx";

-- DropIndex
DROP INDEX "Studio_name_key";

-- AlterTable
ALTER TABLE "Anime" DROP CONSTRAINT "Anime_pkey",
DROP COLUMN "studioId",
DROP COLUMN "titleEn",
DROP COLUMN "titleRu",
ADD COLUMN     "airingStatus" "AnimeAiringStatus" NOT NULL,
ADD COLUMN     "bannerImageUrl" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "type" "AnimeType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Anime_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Studio" DROP CONSTRAINT "Studio_pkey",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "websiteUrl" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Studio_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "AnimeGenre";

-- DropTable
DROP TABLE "Genre";

-- DropTable
DROP TABLE "ListEntry";

-- DropTable
DROP TABLE "Review";

-- DropEnum
DROP TYPE "WatchStatus";

-- CreateTable
CREATE TABLE "Manga" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "MangaType" NOT NULL,
    "publishingStatus" "MangaPublishingStatus" NOT NULL,
    "chapters" INTEGER,
    "volumes" INTEGER,
    "rating" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "coverImageUrl" TEXT,
    "bannerImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "websiteUrl" TEXT,
    "birthDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeListEntry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "status" "AnimeStatus" NOT NULL,
    "score" INTEGER,
    "progressEpisodes" INTEGER,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimeListEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MangaListEntry" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mangaId" INTEGER NOT NULL,
    "status" "MangaStatus" NOT NULL,
    "score" INTEGER,
    "progressChapters" INTEGER,
    "progressVolumes" INTEGER,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MangaListEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnimeReview" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "animeId" INTEGER NOT NULL,
    "recommendation" "ReviewRecommendation" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimeReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MangaReview" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "mangaId" INTEGER NOT NULL,
    "recommendation" "ReviewRecommendation" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MangaReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AnimeToStudio" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AnimeToStudio_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AuthorToManga" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AuthorToManga_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manga_slug_key" ON "Manga"("slug");

-- CreateIndex
CREATE INDEX "Manga_title_idx" ON "Manga"("title");

-- CreateIndex
CREATE INDEX "Manga_slug_idx" ON "Manga"("slug");

-- CreateIndex
CREATE INDEX "Manga_type_idx" ON "Manga"("type");

-- CreateIndex
CREATE INDEX "Manga_publishingStatus_idx" ON "Manga"("publishingStatus");

-- CreateIndex
CREATE INDEX "Manga_rating_idx" ON "Manga"("rating");

-- CreateIndex
CREATE INDEX "Manga_startDate_idx" ON "Manga"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- CreateIndex
CREATE INDEX "Author_name_idx" ON "Author"("name");

-- CreateIndex
CREATE INDEX "Author_slug_idx" ON "Author"("slug");

-- CreateIndex
CREATE INDEX "AnimeListEntry_userId_idx" ON "AnimeListEntry"("userId");

-- CreateIndex
CREATE INDEX "AnimeListEntry_animeId_idx" ON "AnimeListEntry"("animeId");

-- CreateIndex
CREATE INDEX "AnimeListEntry_status_idx" ON "AnimeListEntry"("status");

-- CreateIndex
CREATE INDEX "AnimeListEntry_score_idx" ON "AnimeListEntry"("score");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeListEntry_userId_animeId_key" ON "AnimeListEntry"("userId", "animeId");

-- CreateIndex
CREATE INDEX "MangaListEntry_userId_idx" ON "MangaListEntry"("userId");

-- CreateIndex
CREATE INDEX "MangaListEntry_mangaId_idx" ON "MangaListEntry"("mangaId");

-- CreateIndex
CREATE INDEX "MangaListEntry_status_idx" ON "MangaListEntry"("status");

-- CreateIndex
CREATE INDEX "MangaListEntry_score_idx" ON "MangaListEntry"("score");

-- CreateIndex
CREATE UNIQUE INDEX "MangaListEntry_userId_mangaId_key" ON "MangaListEntry"("userId", "mangaId");

-- CreateIndex
CREATE INDEX "AnimeReview_userId_idx" ON "AnimeReview"("userId");

-- CreateIndex
CREATE INDEX "AnimeReview_animeId_idx" ON "AnimeReview"("animeId");

-- CreateIndex
CREATE INDEX "AnimeReview_recommendation_idx" ON "AnimeReview"("recommendation");

-- CreateIndex
CREATE UNIQUE INDEX "AnimeReview_userId_animeId_key" ON "AnimeReview"("userId", "animeId");

-- CreateIndex
CREATE INDEX "MangaReview_userId_idx" ON "MangaReview"("userId");

-- CreateIndex
CREATE INDEX "MangaReview_mangaId_idx" ON "MangaReview"("mangaId");

-- CreateIndex
CREATE INDEX "MangaReview_recommendation_idx" ON "MangaReview"("recommendation");

-- CreateIndex
CREATE UNIQUE INDEX "MangaReview_userId_mangaId_key" ON "MangaReview"("userId", "mangaId");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_title_idx" ON "News"("title");

-- CreateIndex
CREATE INDEX "News_slug_idx" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");

-- CreateIndex
CREATE INDEX "_AnimeToStudio_B_index" ON "_AnimeToStudio"("B");

-- CreateIndex
CREATE INDEX "_AuthorToManga_B_index" ON "_AuthorToManga"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Anime_slug_key" ON "Anime"("slug");

-- CreateIndex
CREATE INDEX "Anime_title_idx" ON "Anime"("title");

-- CreateIndex
CREATE INDEX "Anime_slug_idx" ON "Anime"("slug");

-- CreateIndex
CREATE INDEX "Anime_type_idx" ON "Anime"("type");

-- CreateIndex
CREATE INDEX "Anime_airingStatus_idx" ON "Anime"("airingStatus");

-- CreateIndex
CREATE INDEX "Anime_rating_idx" ON "Anime"("rating");

-- CreateIndex
CREATE INDEX "Anime_startDate_idx" ON "Anime"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Studio_slug_key" ON "Studio"("slug");

-- CreateIndex
CREATE INDEX "Studio_name_idx" ON "Studio"("name");

-- CreateIndex
CREATE INDEX "Studio_slug_idx" ON "Studio"("slug");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "AnimeListEntry" ADD CONSTRAINT "AnimeListEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeListEntry" ADD CONSTRAINT "AnimeListEntry_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaListEntry" ADD CONSTRAINT "MangaListEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaListEntry" ADD CONSTRAINT "MangaListEntry_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeReview" ADD CONSTRAINT "AnimeReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnimeReview" ADD CONSTRAINT "AnimeReview_animeId_fkey" FOREIGN KEY ("animeId") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaReview" ADD CONSTRAINT "MangaReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MangaReview" ADD CONSTRAINT "MangaReview_mangaId_fkey" FOREIGN KEY ("mangaId") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToStudio" ADD CONSTRAINT "_AnimeToStudio_A_fkey" FOREIGN KEY ("A") REFERENCES "Anime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnimeToStudio" ADD CONSTRAINT "_AnimeToStudio_B_fkey" FOREIGN KEY ("B") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToManga" ADD CONSTRAINT "_AuthorToManga_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToManga" ADD CONSTRAINT "_AuthorToManga_B_fkey" FOREIGN KEY ("B") REFERENCES "Manga"("id") ON DELETE CASCADE ON UPDATE CASCADE;

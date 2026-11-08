/*
  Warnings:

  - You are about to drop the `AnimeReview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MangaReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('ANIME', 'MANGA');

-- DropForeignKey
ALTER TABLE "AnimeReview" DROP CONSTRAINT "AnimeReview_animeId_fkey";

-- DropForeignKey
ALTER TABLE "AnimeReview" DROP CONSTRAINT "AnimeReview_userId_fkey";

-- DropForeignKey
ALTER TABLE "MangaReview" DROP CONSTRAINT "MangaReview_mangaId_fkey";

-- DropForeignKey
ALTER TABLE "MangaReview" DROP CONSTRAINT "MangaReview_userId_fkey";

-- DropIndex
DROP INDEX "Anime_airingStatus_idx";

-- DropIndex
DROP INDEX "Anime_type_idx";

-- DropIndex
DROP INDEX "AnimeListEntry_score_idx";

-- DropIndex
DROP INDEX "AnimeListEntry_status_idx";

-- DropIndex
DROP INDEX "Manga_publishingStatus_idx";

-- DropIndex
DROP INDEX "Manga_type_idx";

-- DropIndex
DROP INDEX "MangaListEntry_score_idx";

-- DropIndex
DROP INDEX "MangaListEntry_status_idx";

-- DropTable
DROP TABLE "AnimeReview";

-- DropTable
DROP TABLE "MangaReview";

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetType" "ReviewTargetType" NOT NULL,
    "targetId" INTEGER NOT NULL,
    "recommendation" "ReviewRecommendation" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_targetType_targetId_idx" ON "Review"("targetType", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_targetType_targetId_key" ON "Review"("userId", "targetType", "targetId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

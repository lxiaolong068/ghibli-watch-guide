/*
  Warnings:

  - A unique constraint covering the columns `[tmdbId,platformId,regionId]` on the table `Availability` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Availability_movieId_platformId_regionId_key";

-- AlterTable
ALTER TABLE "Availability" ADD COLUMN     "tmdbId" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Availability_tmdbId_idx" ON "Availability"("tmdbId");

-- CreateIndex
CREATE UNIQUE INDEX "Availability_tmdbId_platformId_regionId_key" ON "Availability"("tmdbId", "platformId", "regionId");

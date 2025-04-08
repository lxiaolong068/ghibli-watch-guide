/*
  Warnings:

  - Added the required column `director` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `synopsis` to the `Movie` table without a default value. This is not possible if the table is not empty.
  - Made the column `website` on table `Platform` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Movie" ADD COLUMN     "director" TEXT NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "posterUrl" TEXT,
ADD COLUMN     "synopsis" TEXT NOT NULL,
ADD COLUMN     "titleZh" TEXT;

-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "logo" TEXT,
ALTER COLUMN "website" SET NOT NULL;

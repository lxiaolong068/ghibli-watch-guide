/*
  Warnings:

  - You are about to drop the column `isFree` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `isSubscription` on the `Availability` table. All the data in the column will be lost.
  - Added the required column `type` to the `Availability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "isFree",
DROP COLUMN "isSubscription",
ADD COLUMN     "type" TEXT NOT NULL;

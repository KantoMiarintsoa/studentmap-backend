/*
  Warnings:

  - You are about to drop the column `localisation` on the `University` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "University" DROP COLUMN "localisation",
ADD COLUMN     "neighborhood" TEXT;

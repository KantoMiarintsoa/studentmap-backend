/*
  Warnings:

  - You are about to drop the column `localisation` on the `University` table. All the data in the column will be lost.
  - You are about to drop the column `site` on the `University` table. All the data in the column will be lost.
  - You are about to drop the column `ville` on the `University` table. All the data in the column will be lost.
  - Added the required column `city` to the `University` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webSite` to the `University` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "University" DROP COLUMN "localisation",
DROP COLUMN "site",
DROP COLUMN "ville",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "webSite" TEXT NOT NULL;

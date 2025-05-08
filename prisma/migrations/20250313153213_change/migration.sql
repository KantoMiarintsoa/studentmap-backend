/*
  Warnings:

  - The `mention` column on the `University` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "University" DROP COLUMN "mention",
ADD COLUMN     "mention" TEXT[];

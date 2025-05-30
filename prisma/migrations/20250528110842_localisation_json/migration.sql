/*
  Warnings:

  - The `localisation` column on the `Accommodation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Accommodation" DROP COLUMN "localisation",
ADD COLUMN     "localisation" JSONB;

/*
  Warnings:

  - The `localisation` column on the `University` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Accommodation" ADD COLUMN     "localisation" INTEGER[];

-- AlterTable
ALTER TABLE "University" DROP COLUMN "localisation",
ADD COLUMN     "localisation" INTEGER[];

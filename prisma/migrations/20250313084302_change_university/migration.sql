/*
  Warnings:

  - Added the required column `localisation` to the `University` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "University" ADD COLUMN     "localisation" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `profilPicture` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT', 'OWNER');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilPicture",
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'STUDENT';

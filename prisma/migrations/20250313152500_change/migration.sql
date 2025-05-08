/*
  Warnings:

  - You are about to drop the column `ownerId` on the `University` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "University" DROP CONSTRAINT "University_ownerId_fkey";

-- AlterTable
ALTER TABLE "University" DROP COLUMN "ownerId",
ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_universityId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "universityId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

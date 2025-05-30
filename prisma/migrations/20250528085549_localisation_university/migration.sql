-- AlterTable
ALTER TABLE "University" ADD COLUMN     "localisation" TEXT,
ALTER COLUMN "address" DROP NOT NULL;

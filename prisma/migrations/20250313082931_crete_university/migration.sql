-- CreateEnum
CREATE TYPE "TypeUniversity" AS ENUM ('public', 'prive');

-- AlterEnum
ALTER TYPE "Type" ADD VALUE 'DORTOIR';

-- CreateTable
CREATE TABLE "University" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "mention" TEXT NOT NULL,
    "type" "TypeUniversity" NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

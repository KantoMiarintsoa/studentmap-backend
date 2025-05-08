-- CreateEnum
CREATE TYPE "Type" AS ENUM ('APARTEMENT', 'GUEST', 'BUNGALOW');

-- CreateTable
CREATE TABLE "Accommodation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "receptionCapacity" TEXT NOT NULL,
    "IsAvailable" BOOLEAN NOT NULL DEFAULT false,
    "rentMin" DOUBLE PRECISION NOT NULL,
    "rentMAx" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'Ar',
    "media" JSONB,
    "ownerId" INTEGER NOT NULL,
    "type" "Type" NOT NULL,

    CONSTRAINT "Accommodation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Accommodation" ADD CONSTRAINT "Accommodation_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

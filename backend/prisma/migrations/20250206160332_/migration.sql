/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Dustbins" (
    "id" SERIAL NOT NULL,
    "location" TEXT NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "bioFillLevel" INTEGER NOT NULL DEFAULT 1,
    "nonBioFillLevel" INTEGER NOT NULL DEFAULT 1,
    "totalWaste" INTEGER NOT NULL DEFAULT 0,
    "lastEmptiedAt" TIMESTAMP(3) NOT NULL,
    "installedAt" TIMESTAMP(3) NOT NULL,
    "emptyCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Dustbins_pkey" PRIMARY KEY ("id")
);

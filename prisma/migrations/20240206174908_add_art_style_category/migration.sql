/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ArtStyle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Abstract', 'Digital', 'Fantasy', 'Geometric', 'Historical', 'Illustrative', 'Modern', 'Nature', 'SciFi', 'Technological', 'Traditional');

-- AlterTable
ALTER TABLE "ArtStyle" ADD COLUMN     "category" "Category";

-- CreateIndex
CREATE UNIQUE INDEX "ArtStyle_name_key" ON "ArtStyle"("name");

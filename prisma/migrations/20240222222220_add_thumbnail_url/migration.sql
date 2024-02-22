/*
  Warnings:

  - A unique constraint covering the columns `[thumbnailUrl]` on the table `Image` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "thumbnailUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Image_thumbnailUrl_key" ON "Image"("thumbnailUrl");

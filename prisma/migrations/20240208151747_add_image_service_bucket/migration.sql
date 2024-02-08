/*
  Warnings:

  - You are about to drop the column `exampleImageUrl` on the `ArtStyle` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[url]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicUrl]` on the table `Image` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bucket` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicUrl` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StorageService" AS ENUM ('R2');

-- AlterTable
ALTER TABLE "ArtStyle" DROP COLUMN "exampleImageUrl",
ADD COLUMN     "exampleUrl" TEXT;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "bucket" TEXT NOT NULL,
ADD COLUMN     "publicUrl" TEXT NOT NULL,
ADD COLUMN     "service" "StorageService" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Image_url_key" ON "Image"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Image_publicUrl_key" ON "Image"("publicUrl");

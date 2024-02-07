-- CreateEnum
CREATE TYPE "IntendedUse" AS ENUM ('Personal', 'Blog', 'Newsletter', 'SocialMedia', 'BookCover', 'BookInterior', 'PodcastCover', 'PodcastEpisode', 'Other');

-- CreateEnum
CREATE TYPE "AspectRatio" AS ENUM ('Square', 'Portrait', 'Landscape');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "artStyleId" TEXT,
ADD COLUMN     "aspectRatio" "AspectRatio",
ADD COLUMN     "detail" INTEGER,
ADD COLUMN     "exclude" TEXT,
ADD COLUMN     "intendedUse" "IntendedUse",
ADD COLUMN     "keyElements" TEXT,
ADD COLUMN     "mood" TEXT;

-- CreateTable
CREATE TABLE "ArtStyle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prompt" TEXT NOT NULL,
    "exampleImageUrl" TEXT,

    CONSTRAINT "ArtStyle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_artStyleId_fkey" FOREIGN KEY ("artStyleId") REFERENCES "ArtStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

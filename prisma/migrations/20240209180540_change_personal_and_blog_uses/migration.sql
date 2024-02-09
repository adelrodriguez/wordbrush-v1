/*
  Warnings:

  - The values [Personal,Blog] on the enum `IntendedUse` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IntendedUse_new" AS ENUM ('PersonalBlog', 'CompanyBlog', 'Newsletter', 'SocialMedia', 'BookCover', 'BookInterior', 'PodcastCover', 'PodcastEpisode', 'Other');
ALTER TABLE "Project" ALTER COLUMN "intendedUse" TYPE "IntendedUse_new" USING ("intendedUse"::text::"IntendedUse_new");
ALTER TYPE "IntendedUse" RENAME TO "IntendedUse_old";
ALTER TYPE "IntendedUse_new" RENAME TO "IntendedUse";
DROP TYPE "IntendedUse_old";
COMMIT;

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "jobId" TEXT,
ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "prompt" DROP NOT NULL,
ALTER COLUMN "publicUrl" DROP NOT NULL;

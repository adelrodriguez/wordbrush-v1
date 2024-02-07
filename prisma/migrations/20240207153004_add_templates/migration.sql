/*
  Warnings:

  - You are about to drop the column `artStyleId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `aspectRatio` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `detail` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `exclude` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `keyElements` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `mood` on the `Project` table. All the data in the column will be lost.
  - Added the required column `templateId` to the `Image` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Project` required. This step will fail if there are existing NULL values in that column.
  - Made the column `intendedUse` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_artStyleId_fkey";

-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "templateId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "artStyleId",
DROP COLUMN "aspectRatio",
DROP COLUMN "detail",
DROP COLUMN "exclude",
DROP COLUMN "keyElements",
DROP COLUMN "mood",
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "intendedUse" SET NOT NULL;

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "artStyleId" TEXT,
    "aspectRatio" "AspectRatio",
    "detail" INTEGER,
    "exclude" TEXT,
    "keyElements" TEXT,
    "mood" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_artStyleId_fkey" FOREIGN KEY ("artStyleId") REFERENCES "ArtStyle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

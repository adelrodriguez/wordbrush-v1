-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('Draft', 'Submitted', 'Removed');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'Draft';

-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('Natural', 'Vivid');

-- AlterTable
ALTER TABLE "Template" ADD COLUMN     "mode" "Mode" NOT NULL DEFAULT 'Vivid';

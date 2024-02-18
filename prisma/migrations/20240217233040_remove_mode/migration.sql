/*
  Warnings:

  - You are about to drop the column `mode` on the `Template` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Template" DROP COLUMN "mode";

-- DropEnum
DROP TYPE "Mode";

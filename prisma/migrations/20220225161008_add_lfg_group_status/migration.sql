/*
  Warnings:

  - You are about to drop the column `active` on the `LfgGroup` table. All the data in the column will be lost.
  - You are about to drop the column `looking` on the `LfgGroup` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LfgGroupStatus" AS ENUM ('PRE_ADD', 'LOOKING', 'MATCH', 'INACTIVE');

-- DropIndex
DROP INDEX "LfgGroup_active_idx";

-- DropIndex
DROP INDEX "LfgGroup_looking_idx";

-- AlterTable
ALTER TABLE "LfgGroup" DROP COLUMN "active",
DROP COLUMN "looking",
ADD COLUMN     "status" "LfgGroupStatus" NOT NULL DEFAULT E'INACTIVE';

-- CreateIndex
CREATE INDEX "LfgGroup_status_idx" ON "LfgGroup"("status");

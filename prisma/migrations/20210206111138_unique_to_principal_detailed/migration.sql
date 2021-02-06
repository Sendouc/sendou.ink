/*
  Warnings:

  - You are about to drop the column `uniqueId` on the `DetailedMapPlayer` table. All the data in the column will be lost.
  - The migration will add a unique constraint covering the columns `[detailedMapId,principalId]` on the table `DetailedMapPlayer`. If there are existing duplicate values, the migration will fail.
  - Added the required column `principalId` to the `DetailedMapPlayer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DetailedMapPlayer.detailedMapId_uniqueId_unique";

-- DropForeignKey
ALTER TABLE "DetailedMapPlayer" DROP CONSTRAINT "DetailedMapPlayer_uniqueId_fkey";

-- AlterTable
ALTER TABLE "DetailedMapPlayer" DROP COLUMN "uniqueId",
ADD COLUMN     "principalId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "DetailedMapPlayer.detailedMapId_principalId_unique" ON "DetailedMapPlayer"("detailedMapId", "principalId");

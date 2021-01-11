/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[principalId]` on the table `Player`. If there are existing duplicate values, the migration will fail.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "principalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Player.principalId_unique" ON "Player"("principalId");

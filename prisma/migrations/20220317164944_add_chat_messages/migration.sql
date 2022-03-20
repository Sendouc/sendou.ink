/*
  Warnings:

  - Made the column `id` on table `LfgGroupMatchStage` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "LfgGroupMatchStage_id_key" CASCADE;

-- AlterTable
ALTER TABLE "LfgGroupMatchStage" ALTER COLUMN "id" SET NOT NULL,
ADD CONSTRAINT "LfgGroupMatchStage_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameDetailPlayer" ADD CONSTRAINT "GameDetailPlayer_gameDetailTeamId_fkey" FOREIGN KEY ("gameDetailTeamId") REFERENCES "GameDetailTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

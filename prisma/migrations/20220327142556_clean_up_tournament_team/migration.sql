/*
  Warnings:

  - You are about to drop the column `canHost` on the `TournamentTeam` table. All the data in the column will be lost.
  - You are about to drop the column `friendCode` on the `TournamentTeam` table. All the data in the column will be lost.
  - You are about to drop the column `roomPass` on the `TournamentTeam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TournamentTeam" DROP COLUMN "canHost",
DROP COLUMN "friendCode",
DROP COLUMN "roomPass";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canVc" BOOLEAN NOT NULL DEFAULT false;

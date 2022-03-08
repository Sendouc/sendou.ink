/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `LfgGroupMatchStage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Ability" AS ENUM ('CB', 'LDE', 'OG', 'T', 'H', 'NS', 'TI', 'RP', 'AD', 'DR', 'SJ', 'OS', 'BDU', 'REC', 'RES', 'ISM', 'ISS', 'MPU', 'QR', 'QSJ', 'RSU', 'SSU', 'SCU', 'SPU', 'SS', 'BRU', 'EMPTY');

-- AlterTable
ALTER TABLE "LfgGroupMatchStage" ADD COLUMN     "id" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bannedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GameDetail" (
    "id" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lfgStageId" TEXT,

    CONSTRAINT "GameDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameDetailTeam" (
    "id" TEXT NOT NULL,
    "gameDetailId" TEXT NOT NULL,
    "isWinner" BOOLEAN NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "GameDetailTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameDetailPlayer" (
    "gameDetailTeamId" TEXT NOT NULL,
    "principalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weapon" TEXT NOT NULL,
    "mainAbilities" "Ability"[],
    "subAbilities" "Ability"[],
    "kills" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "specials" INTEGER NOT NULL,
    "paint" INTEGER NOT NULL,
    "gear" TEXT[],

    CONSTRAINT "GameDetailPlayer_pkey" PRIMARY KEY ("gameDetailTeamId","principalId")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameDetail_lfgStageId_key" ON "GameDetail"("lfgStageId");

-- CreateIndex
CREATE UNIQUE INDEX "GameDetailTeam_gameDetailId_isWinner_key" ON "GameDetailTeam"("gameDetailId", "isWinner");

-- CreateIndex
CREATE UNIQUE INDEX "LfgGroupMatchStage_id_key" ON "LfgGroupMatchStage"("id");

-- AddForeignKey
ALTER TABLE "GameDetail" ADD CONSTRAINT "GameDetail_lfgStageId_fkey" FOREIGN KEY ("lfgStageId") REFERENCES "LfgGroupMatchStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDetailTeam" ADD CONSTRAINT "GameDetailTeam_gameDetailId_fkey" FOREIGN KEY ("gameDetailId") REFERENCES "GameDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `date` on the `LadderMatch` table. All the data in the column will be lost.
  - You are about to drop the column `links` on the `LadderMatch` table. All the data in the column will be lost.
  - You are about to drop the column `detailedStats` on the `LadderMatch` table. All the data in the column will be lost.
  - You are about to drop the column `resultConfirmed` on the `LadderMatch` table. All the data in the column will be lost.
  - You are about to drop the column `disputed` on the `LadderMatch` table. All the data in the column will be lost.
  - You are about to drop the column `scoreReporterId` on the `LadderMatch` table. All the data in the column will be lost.
  - You are about to drop the column `disputerId` on the `LadderMatch` table. All the data in the column will be lost.
  - Added the required column `dayId` to the `LadderMatch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WinnerLoser" AS ENUM ('WINNER', 'LOSER');

-- AlterTable
ALTER TABLE "LadderMatch" DROP COLUMN "date",
DROP COLUMN "links",
DROP COLUMN "detailedStats",
DROP COLUMN "resultConfirmed",
DROP COLUMN "disputed",
DROP COLUMN "scoreReporterId",
DROP COLUMN "disputerId",
ADD COLUMN     "dayId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "LadderDay" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailedMap" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL,
    "stage" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,
    "duration" INTEGER NOT NULL,
    "winnerScore" INTEGER NOT NULL,
    "loserScore" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "ladderMatchId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailedMapPlayer" (
    "detailedMapId" INTEGER NOT NULL,
    "status" "WinnerLoser" NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weapon" TEXT NOT NULL,
    "mainAbilities" "Ability"[],
    "subAbilities" "Ability"[],
    "kills" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "deaths" INTEGER NOT NULL,
    "specials" INTEGER NOT NULL,
    "paint" INTEGER NOT NULL,
    "gear" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "DetailedMapPlayer.detailedMapId_uniqueId_unique" ON "DetailedMapPlayer"("detailedMapId", "uniqueId");

-- AddForeignKey
ALTER TABLE "DetailedMapPlayer" ADD FOREIGN KEY ("uniqueId") REFERENCES "Player"("switchAccountId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailedMapPlayer" ADD FOREIGN KEY ("detailedMapId") REFERENCES "DetailedMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LadderMatch" ADD FOREIGN KEY ("dayId") REFERENCES "LadderDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

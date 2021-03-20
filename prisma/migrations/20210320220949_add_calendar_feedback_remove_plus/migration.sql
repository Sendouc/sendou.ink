/*
  Warnings:

  - You are about to alter the column `mu` on the `LadderPlayerTrueSkill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `sigma` on the `LadderPlayerTrueSkill` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `leaguePower` on the `LeagueSquad` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to drop the column `region` on the `PlusSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `scoreTotal` on the `PlusVotingSummary` table. All the data in the column will be lost.
  - You are about to alter the column `sensMotion` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `sensStick` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `xPower` on the `XRankPlacement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - The migration will add a unique constraint covering the columns `[votedId,voterId,isStale]` on the table `PlusBallot`. If there are existing duplicate values, the migration will fail.

*/
-- CreateEnum
CREATE TYPE "FeedbackEmoji" AS ENUM ('STARSTRUCK', 'SMILE', 'CONFUSED', 'SOB');

-- CreateEnum
CREATE TYPE "TournamentFormat" AS ENUM ('SE', 'DE', 'GROUPS2SE', 'GROUPS2DE', 'SWISS2SE', 'SWISS2DE', 'SWISS', 'OTHER');

-- DropIndex
DROP INDEX "PlusBallot.votedId_voterId_unique";

-- DropIndex
DROP INDEX "LadderPlayerTrueSkill_userId_unique";

-- AlterTable
ALTER TABLE "LadderPlayerTrueSkill" ALTER COLUMN "mu" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "sigma" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "LeagueSquad" ALTER COLUMN "leaguePower" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PlusSuggestion" DROP COLUMN "region";

-- AlterTable
ALTER TABLE "PlusVotingSummary" DROP COLUMN "scoreTotal";

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "sensMotion" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "sensStick" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "canPostEvents" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "XRankPlacement" ALTER COLUMN "xPower" SET DATA TYPE DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "emoji" "FeedbackEmoji",
    "mobile" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "eventUrl" TEXT NOT NULL,
    "discordInviteUrl" TEXT,
    "tags" TEXT[],
    "isTournament" BOOLEAN NOT NULL DEFAULT true,
    "format" "TournamentFormat",
    "posterId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlusBallot.votedId_voterId_isStale_unique" ON "PlusBallot"("votedId", "voterId", "isStale");

-- AddForeignKey
ALTER TABLE "Feedback" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

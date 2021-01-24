-- CreateEnum
CREATE TYPE "Side" AS ENUM ('ALPHA', 'BRAVO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ladderTeamId" INTEGER;

-- CreateTable
CREATE TABLE "LadderPlayerTrueSkill" (
    "userId" INTEGER NOT NULL,
    "mu" DECIMAL(65,30) NOT NULL,
    "sigma" DECIMAL(65,30) NOT NULL,

    PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "LadderRegisteredTeam" (
    "id" SERIAL NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LadderMatchPlayer" (
    "userId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "team" "Side" NOT NULL,

    PRIMARY KEY ("userId","matchId")
);

-- CreateTable
CREATE TABLE "LadderMatch" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "teamAScore" INTEGER,
    "teamBScore" INTEGER,
    "links" JSONB,
    "maplist" JSONB NOT NULL,
    "detailedStats" JSONB,
    "resultConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "disputed" BOOLEAN NOT NULL DEFAULT false,
    "scoreReporterId" INTEGER,
    "disputerId" INTEGER,
    "order" INTEGER NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LadderPlayerTrueSkill_userId_unique" ON "LadderPlayerTrueSkill"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LadderRegisteredTeam.inviteCode_unique" ON "LadderRegisteredTeam"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "LadderRegisteredTeam.ownerId_unique" ON "LadderRegisteredTeam"("ownerId");

-- AddForeignKey
ALTER TABLE "LadderPlayerTrueSkill" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LadderMatchPlayer" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LadderMatchPlayer" ADD FOREIGN KEY ("matchId") REFERENCES "LadderMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("ladderTeamId") REFERENCES "LadderRegisteredTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

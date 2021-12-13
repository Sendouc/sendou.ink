-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('TW', 'SZ', 'TC', 'RM', 'CB');

-- CreateEnum
CREATE TYPE "BracketType" AS ENUM ('SE', 'DE');

-- CreateEnum
CREATE TYPE "TeamOrder" AS ENUM ('UPPER', 'LOWER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "discordName" TEXT NOT NULL,
    "discordDiscriminator" TEXT NOT NULL,
    "discordAvatar" TEXT,
    "discordRefreshToken" TEXT NOT NULL,
    "twitch" TEXT,
    "twitter" TEXT,
    "youtubeId" TEXT,
    "youtubeName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameForUrl" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "discordInvite" TEXT NOT NULL,
    "twitter" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameForUrl" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "checkInStartTime" TIMESTAMP(3) NOT NULL,
    "bannerBackground" TEXT NOT NULL,
    "bannerTextHSLArgs" TEXT NOT NULL,
    "seeds" TEXT[],
    "organizerId" TEXT NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "Mode" NOT NULL,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "canHost" BOOLEAN NOT NULL DEFAULT true,
    "friendCode" TEXT,
    "inviteCode" TEXT NOT NULL,
    "checkedInTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentTeamMember" (
    "memberId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "captain" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "TrustRelationships" (
    "trustGiverId" TEXT NOT NULL,
    "trustReceiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "TournamentBracket" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "type" "BracketType" NOT NULL,

    CONSTRAINT "TournamentBracket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentRound" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "bracketId" TEXT NOT NULL,

    CONSTRAINT "TournamentRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentRoundStage" (
    "position" INTEGER NOT NULL,
    "roundId" TEXT NOT NULL,
    "stageId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "TournamentMatch" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "winnerDestinationMatchId" TEXT,
    "loserDestinationMatchId" TEXT,

    CONSTRAINT "TournamentMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentMatchParticipant" (
    "order" "TeamOrder" NOT NULL,
    "teamId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "TournamentMatchGameResult" (
    "matchId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "winner" "TeamOrder" NOT NULL,
    "reporterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_StageToTournament" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_nameForUrl_key" ON "Organization"("nameForUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_ownerId_key" ON "Organization"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "Tournament_nameForUrl_organizerId_key" ON "Tournament"("nameForUrl", "organizerId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_name_tournamentId_key" ON "TournamentTeam"("name", "tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeamMember_memberId_tournamentId_key" ON "TournamentTeamMember"("memberId", "tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustRelationships_trustGiverId_trustReceiverId_key" ON "TrustRelationships"("trustGiverId", "trustReceiverId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentRoundStage_position_roundId_key" ON "TournamentRoundStage"("position", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentMatchParticipant_teamId_matchId_key" ON "TournamentMatchParticipant"("teamId", "matchId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentMatchGameResult_matchId_position_key" ON "TournamentMatchGameResult"("matchId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "_StageToTournament_AB_unique" ON "_StageToTournament"("A", "B");

-- CreateIndex
CREATE INDEX "_StageToTournament_B_index" ON "_StageToTournament"("B");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeam" ADD CONSTRAINT "TournamentTeam_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeamMember" ADD CONSTRAINT "TournamentTeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TournamentTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentTeamMember" ADD CONSTRAINT "TournamentTeamMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustRelationships" ADD CONSTRAINT "TrustRelationships_trustGiverId_fkey" FOREIGN KEY ("trustGiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustRelationships" ADD CONSTRAINT "TrustRelationships_trustReceiverId_fkey" FOREIGN KEY ("trustReceiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentBracket" ADD CONSTRAINT "TournamentBracket_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRound" ADD CONSTRAINT "TournamentRound_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "TournamentBracket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRoundStage" ADD CONSTRAINT "TournamentRoundStage_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "TournamentRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentRoundStage" ADD CONSTRAINT "TournamentRoundStage_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "Stage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_winnerDestinationMatchId_fkey" FOREIGN KEY ("winnerDestinationMatchId") REFERENCES "TournamentMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_loserDestinationMatchId_fkey" FOREIGN KEY ("loserDestinationMatchId") REFERENCES "TournamentMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "TournamentRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatchParticipant" ADD CONSTRAINT "TournamentMatchParticipant_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TournamentTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatchParticipant" ADD CONSTRAINT "TournamentMatchParticipant_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "TournamentMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentMatchGameResult" ADD CONSTRAINT "TournamentMatchGameResult_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "TournamentMatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StageToTournament" ADD FOREIGN KEY ("A") REFERENCES "Stage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StageToTournament" ADD FOREIGN KEY ("B") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

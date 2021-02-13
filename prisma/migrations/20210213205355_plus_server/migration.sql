-- CreateEnum
CREATE TYPE "PlusRegion" AS ENUM ('EU', 'NA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "patreonTier" INTEGER;

-- CreateTable
CREATE TABLE "PlusStatus" (
    "userId" INTEGER NOT NULL,
    "voucherId" INTEGER,
    "membershipTier" INTEGER,
    "vouchTier" INTEGER,
    "canVouchFor" INTEGER,
    "canVouchAgainAfter" TIMESTAMP(3),
    "region" "PlusRegion" NOT NULL,
    "nameForVoting" TEXT
);

-- CreateTable
CREATE TABLE "PlusSuggestion" (
    "suggestedId" INTEGER NOT NULL,
    "suggesterId" INTEGER NOT NULL,
    "region" "PlusRegion" NOT NULL,
    "tier" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isResuggestion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlusBallot" (
    "votedId" INTEGER NOT NULL,
    "voterId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "tier" INTEGER NOT NULL,
    "isStale" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "PlusVotingSummary" (
    "userId" INTEGER NOT NULL,
    "tier" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "wasVouched" BOOLEAN NOT NULL,
    "wasSuggested" BOOLEAN NOT NULL,
    "scoreTotal" DECIMAL(65,30) NOT NULL,
    "countsEU" INTEGER[],
    "countsNA" INTEGER[]
);

-- CreateIndex
CREATE UNIQUE INDEX "PlusStatus.userId_unique" ON "PlusStatus"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PlusStatus.voucherId_unique" ON "PlusStatus"("voucherId");

-- CreateIndex
CREATE UNIQUE INDEX "PlusSuggestion.tier_suggestedId_suggesterId_unique" ON "PlusSuggestion"("tier", "suggestedId", "suggesterId");

-- CreateIndex
CREATE UNIQUE INDEX "PlusBallot.votedId_voterId_unique" ON "PlusBallot"("votedId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "PlusVotingSummary.userId_tier_month_year_unique" ON "PlusVotingSummary"("userId", "tier", "month", "year");

-- AddForeignKey
ALTER TABLE "PlusStatus" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlusStatus" ADD FOREIGN KEY ("voucherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlusSuggestion" ADD FOREIGN KEY ("suggestedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlusSuggestion" ADD FOREIGN KEY ("suggesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlusBallot" ADD FOREIGN KEY ("votedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlusBallot" ADD FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlusVotingSummary" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

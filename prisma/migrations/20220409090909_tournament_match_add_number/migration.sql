-- AlterTable
ALTER TABLE "TournamentMatch" ADD COLUMN     "number" INTEGER;

-- AddForeignKey
ALTER TABLE "GameDetail" ADD CONSTRAINT "GameDetail_lfgStageId_fkey" FOREIGN KEY ("lfgStageId") REFERENCES "LfgGroupMatchStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

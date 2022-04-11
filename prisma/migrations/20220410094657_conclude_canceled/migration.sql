-- AlterTable
ALTER TABLE "LfgGroupMatch" ADD COLUMN     "cancelCausingUserId" TEXT;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "amountOfSets" INTEGER;

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "concluded" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "LfgGroupMatch" ADD CONSTRAINT "LfgGroupMatch_cancelCausingUserId_fkey" FOREIGN KEY ("cancelCausingUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

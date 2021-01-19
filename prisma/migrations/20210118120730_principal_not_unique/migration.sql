-- DropIndex
DROP INDEX "Player.principalId_unique";

-- CreateIndex
CREATE INDEX "Player.principalId_index" ON "Player"("principalId");

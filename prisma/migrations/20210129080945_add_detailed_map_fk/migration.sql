-- AddForeignKey
ALTER TABLE "DetailedMap" ADD FOREIGN KEY ("ladderMatchId") REFERENCES "LadderMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { db } from "~/db/sql";

export function findById(id: number) {
  return db
    .selectFrom("GroupMatch")
    .select(({ exists, selectFrom, eb }) => [
      "GroupMatch.id",
      "GroupMatch.alphaGroupId",
      "GroupMatch.bravoGroupId",
      "GroupMatch.createdAt",
      "GroupMatch.reportedAt",
      "GroupMatch.reportedByUserId",
      "GroupMatch.chatCode",
      "GroupMatch.memento",
      exists(
        selectFrom("Skill")
          .select("Skill.id")
          .where("Skill.groupMatchId", "=", id),
      ).as("isLocked"),
      jsonArrayFrom(
        eb
          .selectFrom("GroupMatchMap")
          .select([
            "GroupMatch.id",
            "GroupMatchMap.mode",
            "GroupMatchMap.stageId",
            "GroupMatchMap.source",
            "GroupMatchMap.winnerGroupId",
          ])
          .where("GroupMatchMap.matchId", "=", id)
          .orderBy("GroupMatchMap.index asc"),
      ).as("mapList"),
    ])
    .where("GroupMatch.id", "=", id)
    .executeTakeFirst();
}

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { db } from "~/db/sql";
import { parseParams } from "~/utils/remix";
import { id } from "~/utils/zod";
import type { GetTournamentTeamsResponse } from "../schema";
import { databaseTimestampToDate } from "~/utils/dates";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import {
  handleOptionsRequest,
  requireBearerAuth,
} from "../api-public-utils.server";
import i18next from "~/modules/i18n/i18next.server";
import { cors } from "remix-utils/cors";

const paramsSchema = z.object({
  id,
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await handleOptionsRequest(request);
  requireBearerAuth(request);

  const t = await i18next.getFixedT("en", ["game-misc"]);
  const { id } = parseParams({
    params,
    schema: paramsSchema,
  });

  const teams = await db
    .selectFrom("TournamentTeam")
    .leftJoin("TournamentTeamCheckIn", (join) =>
      join
        .onRef(
          "TournamentTeam.id",
          "=",
          "TournamentTeamCheckIn.tournamentTeamId",
        )
        .on("TournamentTeamCheckIn.bracketIdx", "is", null),
    )
    .select(({ eb }) => [
      "TournamentTeam.id",
      "TournamentTeam.name",
      "TournamentTeam.seed",
      "TournamentTeam.createdAt",
      "TournamentTeamCheckIn.checkedInAt",
      jsonArrayFrom(
        eb
          .selectFrom("TournamentTeamMember")
          .innerJoin("User", "User.id", "TournamentTeamMember.userId")
          .select([
            "User.id as userId",
            "User.discordName",
            "User.discordId",
            "User.discordAvatar",
            "TournamentTeamMember.isOwner",
            "TournamentTeamMember.createdAt",
          ])
          .whereRef(
            "TournamentTeamMember.tournamentTeamId",
            "=",
            "TournamentTeam.id",
          )
          .orderBy("TournamentTeamMember.createdAt asc"),
      ).as("members"),
      jsonArrayFrom(
        eb
          .selectFrom("MapPoolMap")
          .select(["MapPoolMap.stageId", "MapPoolMap.mode"])
          .whereRef("MapPoolMap.tournamentTeamId", "=", "TournamentTeam.id"),
      ).as("mapPool"),
    ])
    .where("TournamentTeam.tournamentId", "=", id)
    .orderBy("TournamentTeam.createdAt asc")
    .execute();

  const result: GetTournamentTeamsResponse = teams.map((team) => {
    return {
      id: team.id,
      name: team.name,
      url: `https://sendou.ink/to/${id}/teams/${team.id}`,
      seed: team.seed,
      registeredAt: databaseTimestampToDate(team.createdAt).toISOString(),
      checkedIn: Boolean(team.checkedInAt),
      members: team.members.map((member) => {
        return {
          userId: member.userId,
          name: member.discordName,
          discordId: member.discordId,
          avatarUrl: member.discordAvatar
            ? `https://cdn.discordapp.com/avatars/${member.discordId}/${member.discordAvatar}.png`
            : null,
          captain: Boolean(member.isOwner),
          joinedAt: databaseTimestampToDate(member.createdAt).toISOString(),
        };
      }),
      mapPool:
        team.mapPool.length > 0
          ? team.mapPool.map((map) => {
              return {
                mode: map.mode,
                stage: {
                  id: map.stageId,
                  name: t(`game-misc:STAGE_${map.stageId}`),
                },
              };
            })
          : null,
    };
  });

  return await cors(request, json(result));
};

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { db } from "~/db/sql";
import { notFoundIfFalsy, parseParams } from "~/utils/remix";
import { id } from "~/utils/zod";
import type { GetTournamentResponse } from "../schema";
import { databaseTimestampToDate } from "~/utils/dates";
import { HACKY_resolvePicture } from "~/features/tournament/tournament-utils";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import {
  handleOptionsRequest,
  requireBearerAuth,
} from "../api-public-utils.server";
import { cors } from "remix-utils/cors";

const paramsSchema = z.object({
  id,
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await handleOptionsRequest(request);
  requireBearerAuth(request);

  const { id } = parseParams({ params, schema: paramsSchema });

  const tournament = notFoundIfFalsy(
    await db
      .selectFrom("Tournament")
      .innerJoin("CalendarEvent", "CalendarEvent.tournamentId", "Tournament.id")
      .innerJoin(
        "CalendarEventDate",
        "CalendarEventDate.eventId",
        "CalendarEvent.id",
      )
      .select(({ eb }) => [
        "CalendarEvent.name",
        "CalendarEventDate.startTime",
        "Tournament.settings",
        jsonArrayFrom(
          eb
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
            .select(["TournamentTeamCheckIn.checkedInAt"])
            .where("TournamentTeam.tournamentId", "=", id),
        ).as("teams"),
      ])
      .where("Tournament.id", "=", id)
      .executeTakeFirst(),
  );

  const result: GetTournamentResponse = {
    name: tournament.name,
    startTime: databaseTimestampToDate(tournament.startTime).toISOString(),
    url: `https://sendou.ink/to/${id}/brackets`,
    logoUrl: `https://sendou.ink${HACKY_resolvePicture(tournament)}`,
    teams: {
      checkedInCount: tournament.teams.filter((team) => team.checkedInAt)
        .length,
      registeredCount: tournament.teams.length,
    },
    brackets: tournament.settings.bracketProgression.map((bp) => ({
      name: bp.name,
      type: bp.type,
    })),
  };

  return await cors(request, json(result));
};

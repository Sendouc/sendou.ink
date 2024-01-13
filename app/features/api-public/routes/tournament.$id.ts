import type { LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { db } from "~/db/sql";
import { notFoundIfFalsy, parseParams } from "~/utils/remix";
import { id } from "~/utils/zod";
import type { GetTournamentResponse } from "../schema";
import { databaseTimestampToDate } from "~/utils/dates";
import { HACKY_resolvePicture } from "~/features/tournament/tournament-utils";
import { jsonArrayFrom } from "kysely/helpers/sqlite";

const paramsSchema = z.object({
  id,
});

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { id } = parseParams({ params, schema: paramsSchema });

  const tournament = notFoundIfFalsy(
    await db
      .selectFrom("Tournament")
      .innerJoin("CalendarEvent", "CalendarEvent.tournamentId", "Tournament.id")
      .innerJoin(
        "CalendarEventDate",
        "CalendarEventDate.id",
        "CalendarEvent.id",
      )
      .select(({ eb }) => [
        "CalendarEvent.name",
        "CalendarEventDate.startTime",
        jsonArrayFrom(
          eb
            .selectFrom("TournamentTeam")
            .leftJoin(
              "TournamentTeamCheckIn",
              "TournamentTeam.id",
              "TournamentTeamCheckIn.tournamentTeamId",
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
    logoUrl: HACKY_resolvePicture(tournament),
    teams: {
      checkedInCount: tournament.teams.filter((team) => team.checkedInAt)
        .length,
      registeredCount: tournament.teams.length,
    },
  };

  return result;
};

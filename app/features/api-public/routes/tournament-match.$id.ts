import type { LoaderFunctionArgs } from "@remix-run/node";
import { z } from "zod";
import { db } from "~/db/sql";
import { notFoundIfFalsy, parseParams } from "~/utils/remix";
import { id } from "~/utils/zod";
import type { GetTournamentMatchResponse } from "../schema";
import { jsonArrayFrom } from "kysely/helpers/sqlite";
import { resolveMapList } from "~/features/tournament-bracket/core/mapList.server";
import { requireBearerAuth } from "../api-public-utils.server";
import i18next from "~/modules/i18n/i18next.server";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";

const paramsSchema = z.object({
  id,
});

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  requireBearerAuth(request);

  const t = await i18next.getFixedT("en", ["game-misc"]);
  const { id } = parseParams({
    params,
    schema: paramsSchema,
  });

  const match = notFoundIfFalsy(
    await db
      .selectFrom("TournamentMatch")
      .innerJoin(
        "TournamentStage",
        "TournamentStage.id",
        "TournamentMatch.stageId",
      )
      .innerJoin("Tournament", "Tournament.id", "TournamentStage.tournamentId")
      .innerJoin(
        "TournamentRound",
        "TournamentRound.id",
        "TournamentMatch.roundId",
      )
      .select(({ eb }) => [
        "TournamentStage.tournamentId",
        "TournamentMatch.id",
        "TournamentMatch.opponentOne",
        "TournamentMatch.opponentTwo",
        "Tournament.mapPickingStyle",
        "TournamentMatch.bestOf",
        "TournamentRound.maps",
        jsonArrayFrom(
          eb
            .selectFrom("TournamentMatchGameResult")
            .select(({ eb: innerEb }) => [
              "TournamentMatchGameResult.stageId",
              "TournamentMatchGameResult.mode",
              "TournamentMatchGameResult.winnerTeamId",
              "TournamentMatchGameResult.source",
              jsonArrayFrom(
                innerEb
                  .selectFrom("TournamentMatchGameResultParticipant")
                  .select("TournamentMatchGameResultParticipant.userId")
                  .whereRef(
                    "TournamentMatchGameResultParticipant.matchGameResultId",
                    "=",
                    "TournamentMatchGameResult.id",
                  ),
              ).as("participants"),
            ])
            .where("TournamentMatchGameResult.matchId", "=", id)
            .orderBy("TournamentMatchGameResult.number asc"),
        ).as("playedMapList"),
      ])
      .where("TournamentMatch.id", "=", id)
      .executeTakeFirst(),
  );

  const parseSource = (
    rawSource: string,
  ): NonNullable<GetTournamentMatchResponse["mapList"]>[number]["source"] => {
    const parsed = Number(rawSource);
    if (Number.isNaN(parsed)) {
      return rawSource as "DEFAULT" | "TIEBREAKER" | "BOTH";
    }

    return parsed;
  };
  const mapList = async (): Promise<GetTournamentMatchResponse["mapList"]> => {
    if (!match.opponentOne.id || !match.opponentTwo.id) {
      return null;
    }

    if (
      match.opponentOne.result === "win" ||
      match.opponentTwo.result === "win"
    ) {
      return match.playedMapList.map((map) => ({
        map: {
          mode: map.mode,
          stage: {
            id: map.stageId,
            name: t(`game-misc:STAGE_${map.stageId}`),
          },
        },
        participatedUserIds: map.participants.map((p) => p.userId),
        winnerTeamId: map.winnerTeamId,
        source: parseSource(map.source),
      }));
    }

    const events = match.maps?.counterpicks
      ? await TournamentRepository.counterpickEventsByMatchId(match.id)
      : [];

    return resolveMapList({
      bestOf: match.bestOf,
      tournamentId: match.tournamentId,
      matchId: id,
      teams: [match.opponentOne.id, match.opponentTwo.id],
      mapPickingStyle: match.mapPickingStyle,
      maps: match.maps,
      events,
    }).map((map) => {
      return {
        map: {
          mode: map.mode,
          stage: {
            id: map.stageId,
            name: t(`game-misc:STAGE_${map.stageId}`),
          },
        },
        participatedUserIds: null,
        winnerTeamId: null,
        source: map.source,
      };
    });
  };

  const result: GetTournamentMatchResponse = {
    teamOne: match.opponentOne.id
      ? {
          id: match.opponentOne.id,
          score: match.opponentOne.score ?? 0,
        }
      : null,
    teamTwo: match.opponentTwo.id
      ? {
          id: match.opponentTwo.id,
          score: match.opponentTwo.score ?? 0,
        }
      : null,
    url: `https://sendou.ink/to/${match.tournamentId}/matches/${id}`,
    mapList: await mapList(),
  };

  return result;
};

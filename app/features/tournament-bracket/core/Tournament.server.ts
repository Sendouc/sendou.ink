import { Tournament } from "./Tournament";
import { getTournamentManager } from "..";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { notFoundIfFalsy } from "~/utils/remix";
import type { Unwrapped } from "~/utils/types";

const manager = getTournamentManager("SQL");

export type TournamentData = Unwrapped<typeof tournamentData>;
export type TournamentDataTeam = TournamentData["ctx"]["teams"][number];
export async function tournamentData({
  user,
  tournamentId,
}: {
  user?: { id: number };
  tournamentId: number;
}) {
  const ctx = notFoundIfFalsy(
    await TournamentRepository.findByIdNew(tournamentId),
  );

  return {
    data: manager.get.tournamentData(tournamentId),
    ctx: {
      ...ctx,
      teams: ctx.teams.map((team) => {
        const isOwnTeam = team.members.some(
          (member) => member.userId === user?.id,
        );

        return {
          ...team,
          inviteCode: isOwnTeam ? team.inviteCode : null,
        };
      }),
    },
  };
}

export async function tournamentFromDB(args: {
  user: { id: number } | undefined;
  tournamentId: number;
}) {
  return new Tournament(await tournamentData(args));
}

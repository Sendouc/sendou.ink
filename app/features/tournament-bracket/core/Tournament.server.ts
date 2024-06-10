import { Tournament } from "./Tournament";
import * as TournamentRepository from "~/features/tournament/TournamentRepository.server";
import { notFoundIfFalsy } from "~/utils/remix";
import type { Unwrapped } from "~/utils/types";
import { getServerTournamentManager } from "./brackets-manager/manager.server";
import { HACKY_resolvePicture } from "~/features/tournament/tournament-utils";
import { userSubmittedImage } from "~/utils/urls";

const manager = getServerTournamentManager();

export type TournamentData = Unwrapped<typeof tournamentData>;
export type TournamentDataTeam = TournamentData["ctx"]["teams"][number];
export async function tournamentData({
  user,
  tournamentId,
}: {
  user?: { id: number };
  tournamentId: number;
}) {
  const data = manager.get.tournamentData(tournamentId);
  const ctx = notFoundIfFalsy(
    await TournamentRepository.findById(tournamentId),
  );

  const revealAllMapPools =
    data.stage.length > 0 ||
    ctx.author.id === user?.id ||
    ctx.staff.some(
      (staff) => staff.id === user?.id && staff.role === "ORGANIZER",
    );
  const logo = ctx.logoUrl
    ? userSubmittedImage(ctx.logoUrl)
    : HACKY_resolvePicture(ctx);

  return {
    data,
    ctx: {
      ...ctx,
      logoSrc: logo,
      teams: ctx.teams.map((team) => {
        const isOwnTeam = team.members.some(
          (member) => member.userId === user?.id,
        );

        return {
          ...team,
          mapPool: revealAllMapPools || isOwnTeam ? team.mapPool : null,
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

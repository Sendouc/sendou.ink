import { Ability } from "@prisma/client";
import { db } from "~/utils/db.server";

export interface CreateGameDetailsInput {
  id: string;
  duration: number;
  startedAt: Date;
  lfgStageId: string;
  teams: {
    id: string;
    isWinner: boolean;
    score: number;
    players: {
      principalId: string;
      name: string;
      weapon: string;
      mainAbilities: Ability[];
      subAbilities: Ability[];
      kills: number;
      assists: number;
      deaths: number;
      specials: number;
      paint: number;
      gear: string[];
    }[];
  }[];
}
export function create(details: CreateGameDetailsInput[]) {
  return db.$transaction([
    db.gameDetail.createMany({
      data: details.map(({ teams: _teams, ...detail }) => detail),
    }),
    db.gameDetailTeam.createMany({
      data: details.flatMap((detail) =>
        detail.teams.map(({ players: _players, ...team }) => ({
          gameDetailId: detail.id,
          ...team,
        }))
      ),
    }),
    db.gameDetailPlayer.createMany({
      data: details
        .flatMap((detail) => detail.teams)
        .flatMap((team) =>
          team.players.map((player) => ({
            gameDetailTeamId: team.id,
            ...player,
          }))
        ),
    }),
  ]);
}

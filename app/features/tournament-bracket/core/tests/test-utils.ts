import { BRACKET_NAMES } from "~/features/tournament/tournament-constants";
import { Tournament } from "../Tournament";
import type { TournamentData } from "../Tournament.server";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";

const tournamentCtxTeam = (
  teamId: number,
  partial?: Partial<TournamentData["ctx"]["teams"][0]>,
): TournamentData["ctx"]["teams"][0] => {
  return {
    checkIns: [{ checkedInAt: 1705858841, bracketIdx: null }],
    createdAt: 0,
    id: teamId,
    inviteCode: null,
    team: null,
    mapPool: [],
    members: [],
    name: "Team " + teamId,
    prefersNotToHost: 0,
    droppedOut: 0,
    noScreen: 0,
    seed: teamId + 1,
    ...partial,
  };
};

const nTeams = (n: number, startingId: number) => {
  const teams = [];
  for (let i = 0; i < n; i++) {
    teams.push(tournamentCtxTeam(i, tournamentCtxTeam(i + startingId)));
  }
  return teams;
};

export const testTournament = (
  data: ValueToArray<DataTypes>,
  partialCtx?: Partial<TournamentData["ctx"]>,
) => {
  return new Tournament({
    data,
    ctx: {
      eventId: 1,
      id: 1,
      description: null,
      rules: null,
      logoUrl: null,
      avatarImgId: null,
      discordUrl: null,
      startTime: 1705858842,
      isFinalized: 0,
      name: "test",
      showMapListGenerator: 0,
      castTwitchAccounts: [],
      staff: [],
      tieBreakerMapPool: [],
      participatedUsers: [],
      mapPickingStyle: "AUTO_SZ",
      settings: {
        bracketProgression: [
          { name: BRACKET_NAMES.MAIN, type: "double_elimination" },
        ],
      },
      inProgressBrackets: data.stage.map((stage) => ({
        id: stage.id,
        name: stage.name,
        type: stage.type,
        createdAt: 0,
      })),
      castedMatchesInfo: null,
      teams: nTeams(
        data.participant.length,
        Math.min(...data.participant.map((p) => p.id)),
      ),
      author: {
        chatNameColor: null,
        customUrl: null,
        discordAvatar: null,
        discordId: "123",
        discordName: "test",
        id: 1,
      },
      ...partialCtx,
    },
  });
};

export const adjustResults = (
  data: ValueToArray<DataTypes>,
  adjustedArr: Array<{
    ids: [number, number];
    score: [number, number];
    points?: [number, number];
  }>,
): ValueToArray<DataTypes> => {
  return {
    ...data,
    match: data.match.map((match, idx) => {
      const adjusted = adjustedArr[idx];
      if (!adjusted) throw new Error("No adjusted result for match " + idx);

      if (adjusted.ids[0] !== match.opponent1!.id) {
        throw new Error("Adjusted match opponent1 id does not match");
      }

      if (adjusted.ids[1] !== match.opponent2!.id) {
        throw new Error("Adjusted match opponent2 id does not match");
      }

      return {
        ...match,
        opponent1: {
          ...match.opponent1!,
          score: adjusted.score[0],
          result: adjusted.score[0] > adjusted.score[1] ? "win" : "loss",
          totalPoints: adjusted.points
            ? adjusted.points[0]
            : adjusted.score[0] > adjusted.score[1]
              ? 100
              : 0,
        },
        opponent2: {
          ...match.opponent2!,
          score: adjusted.score[1],
          result: adjusted.score[1] > adjusted.score[0] ? "win" : "loss",
          totalPoints: adjusted.points
            ? adjusted.points[1]
            : adjusted.score[1] > adjusted.score[0]
              ? 100
              : 0,
        },
      };
    }),
  };
};

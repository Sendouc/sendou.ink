import type { Params } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { TournamentMatch } from "~/db/types";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import type { TournamentMaplistSource } from "~/modules/tournament-map-list-generator";
import {
  seededRandom,
  sourceTypes,
} from "~/modules/tournament-map-list-generator";
import { removeDuplicates } from "~/utils/arrays";
import type { FindMatchById } from "../tournament-bracket/queries/findMatchById.server";
import type { TournamentDataTeam } from "./core/Tournament.server";
import type { Tournament } from "./core/Tournament";
import type { ModeShort, StageId } from "~/modules/in-game-lists";
import type { TFunction } from "i18next";
import type { TournamentRoundMaps } from "~/db/tables";
import { sumArray } from "~/utils/number";
import type { TournamentLoaderData } from "../tournament/routes/to.$id";
import { TOURNAMENT } from "../tournament/tournament-constants";

export function matchIdFromParams(params: Params<string>) {
  const result = Number(params["mid"]);
  invariant(!Number.isNaN(result), "mid is not a number");

  return result;
}

const NUM_MAP = {
  "1": ["1", "2", "4"],
  "2": ["2", "1", "3", "5"],
  "3": ["3", "2", "6"],
  "4": ["4", "1", "5", "7"],
  "5": ["5", "2", "4", "6", "8"],
  "6": ["6", "3", "5", "9"],
  "7": ["7", "4", "8"],
  "8": ["8", "7", "5", "9", "0"],
  "9": ["9", "6", "8"],
  "0": ["0", "8"],
};
export function resolveRoomPass(matchId: TournamentMatch["id"]) {
  let pass = "5";
  for (let i = 0; i < 3; i++) {
    const { shuffle } = seededRandom(`${matchId}-${i}`);

    const key = pass[i] as keyof typeof NUM_MAP;
    const opts = NUM_MAP[key];
    const next = shuffle(opts)[0];
    pass += next;
  }

  // prevent 5555 since many use it as a default pass
  // making it a bit more common guess
  if (pass === "5555") return "5800";

  return pass;
}

export function resolveHostingTeam(
  teams: [TournamentDataTeam, TournamentDataTeam],
) {
  if (teams[0].prefersNotToHost && !teams[1].prefersNotToHost) return teams[1];
  if (!teams[0].prefersNotToHost && teams[1].prefersNotToHost) return teams[0];
  if (!teams[0].seed && !teams[1].seed) return teams[0];
  if (!teams[0].seed) return teams[1];
  if (!teams[1].seed) return teams[0];
  if (teams[0].seed < teams[1].seed) return teams[0];
  if (teams[1].seed < teams[0].seed) return teams[1];

  console.error("resolveHostingTeam: unexpected default");
  return teams[0];
}

export function mapCountPlayedInSetWithCertainty({
  bestOf,
  scores,
}: {
  bestOf: number;
  scores: [number, number];
}) {
  const maxScore = Math.max(...scores);
  const scoreSum = scores.reduce((acc, curr) => acc + curr, 0);

  return scoreSum + (Math.ceil(bestOf / 2) - maxScore);
}

export function checkSourceIsValid({
  source,
  match,
}: {
  source: string;
  match: NonNullable<FindMatchById>;
}) {
  if (sourceTypes.includes(source as any)) return true;

  const asTeamId = Number(source);

  if (match.opponentOne?.id === asTeamId) return true;
  if (match.opponentTwo?.id === asTeamId) return true;

  return false;
}

export function bracketSubscriptionKey(tournamentId: number) {
  return `BRACKET_CHANGED_${tournamentId}`;
}

export function matchSubscriptionKey(matchId: number) {
  return `MATCH_CHANGED_${matchId}`;
}

export function fillWithNullTillPowerOfTwo<T>(arr: T[]) {
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(arr.length)));
  const nullsToAdd = nextPowerOfTwo - arr.length;

  return [...arr, ...new Array(nullsToAdd).fill(null)];
}

export function everyMatchIsOver(
  bracket: Pick<ValueToArray<DataTypes>, "match">,
) {
  // winners, losers & grand finals+bracket reset are all different stages
  const isDoubleElimination =
    removeDuplicates(bracket.match.map((match) => match.group_id)).length === 3;

  // tournament didn't start yet
  if (bracket.match.length === 0) return false;

  let lastWinner = -1;
  for (const [i, match] of bracket.match.entries()) {
    // special case - bracket reset might not be played depending on who wins in the grands
    const isLast = i === bracket.match.length - 1;
    if (isLast && lastWinner === 1 && isDoubleElimination) {
      continue;
    }
    // BYE
    if (match.opponent1 === null || match.opponent2 === null) {
      continue;
    }
    if (
      match.opponent1?.result !== "win" &&
      match.opponent2?.result !== "win"
    ) {
      return false;
    }

    lastWinner = match.opponent1?.result === "win" ? 1 : 2;
  }

  return true;
}

export function everyBracketOver(tournament: ValueToArray<DataTypes>) {
  const stageIds = tournament.stage.map((stage) => stage.id);

  for (const stageId of stageIds) {
    const matches = tournament.match.filter(
      (match) => match.stage_id === stageId,
    );

    if (!everyMatchIsOver({ match: matches })) {
      return false;
    }
  }

  return true;
}

export const bracketHasStarted = (bracket: ValueToArray<DataTypes>) =>
  bracket.stage[0] && bracket.stage[0].id !== 0;

export function matchIsLocked({
  tournament,
  matchId,
  scores,
}: {
  tournament: Tournament;
  matchId: number;
  scores: [number, number];
}) {
  if (scores[0] !== 0 || scores[1] !== 0) return false;

  const locked = tournament.ctx.castedMatchesInfo?.lockedMatches ?? [];

  return locked.includes(matchId);
}

export function pickInfoText({
  map,
  t,
  teams,
}: {
  map?: { stageId: StageId; mode: ModeShort; source: TournamentMaplistSource };
  t: TFunction;
  teams: [TournamentDataTeam, TournamentDataTeam];
}) {
  if (!map) return "";

  if (map.source === teams[0].id) {
    return t("tournament:pickInfo.team", { number: 1 });
  }
  if (map.source === teams[1].id) {
    return t("tournament:pickInfo.team", { number: 2 });
  }
  if (map.source === "TIEBREAKER") {
    return t("tournament:pickInfo.tiebreaker");
  }
  if (map.source === "BOTH") return t("tournament:pickInfo.both");
  if (map.source === "DEFAULT") return t("tournament:pickInfo.default");
  if (map.source === "COUNTERPICK") {
    return t("tournament:pickInfo.counterpick");
  }
  if (map.source === "TO") return "";

  console.error(`Unknown source: ${String(map.source)}`);
  return "";
}

export function groupNumberToLetter(groupNumber: number) {
  return String.fromCharCode(65 + groupNumber - 1).toUpperCase();
}

export function isSetOverByResults({
  results,
  count,
  countType,
}: {
  results: Array<{ winnerTeamId: number }>;
  count: number;
  countType: TournamentRoundMaps["type"];
}) {
  const winCounts = new Map<number, number>();

  for (const result of results) {
    const count = winCounts.get(result.winnerTeamId) ?? 0;
    winCounts.set(result.winnerTeamId, count + 1);
  }

  if (countType === "PLAY_ALL") {
    return sumArray(Array.from(winCounts.values())) === count;
  }

  const maxWins = Math.max(...Array.from(winCounts.values()));

  // best of
  return maxWins >= Math.ceil(count / 2);
}

export function isSetOverByScore({
  scores,
  count,
  countType,
}: {
  scores: [number, number];
  count: number;
  countType: TournamentRoundMaps["type"];
}) {
  if (countType === "PLAY_ALL") {
    return sumArray(scores) === count;
  }

  const matchOverAtXWins = Math.ceil(count / 2);
  return scores[0] === matchOverAtXWins || scores[1] === matchOverAtXWins;
}

export function tournamentTeamToActiveRosterUserIds(
  team: TournamentLoaderData["tournament"]["ctx"]["teams"][number],
) {
  if (
    team.activeRosterUserIds &&
    team.activeRosterUserIds.length === TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL
  ) {
    return team.activeRosterUserIds;
  }

  // they don't need to select active roster as they have no subs
  if (team.members.length === TOURNAMENT.TEAM_MIN_MEMBERS_FOR_FULL) {
    return team.members.map((member) => member.userId);
  }

  return null;
}

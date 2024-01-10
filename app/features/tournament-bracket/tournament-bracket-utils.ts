import type { Stage } from "~/modules/brackets-model";
import type { TournamentMatch, TournamentStage } from "~/db/types";
import {
  sourceTypes,
  seededRandom,
} from "~/modules/tournament-map-list-generator";
import { assertUnreachable } from "~/utils/types";
import type { FindMatchById } from "../tournament-bracket/queries/findMatchById.server";
import type {
  TournamentLoaderData,
  TournamentLoaderTeam,
} from "~/features/tournament";
import type { Params } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { DataTypes, ValueToArray } from "~/modules/brackets-manager/types";
import { HACKY_isInviteOnlyEvent } from "../tournament/tournament-utils";
import type { BracketFormat } from "~/db/tables";

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
  teams: [TournamentLoaderTeam, TournamentLoaderTeam],
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

export function resolveTournamentStageType(
  format: BracketFormat,
): TournamentStage["type"] {
  switch (format) {
    case "SE":
      return "single_elimination";
    case "DE":
      return "double_elimination";
    case "RR":
      return "round_robin";
    default: {
      assertUnreachable(format);
    }
  }
}

export function resolveTournamentStageSettings(
  format: BracketFormat,
): Stage["settings"] {
  switch (format) {
    case "SE":
      return { consolationFinal: false };
    case "DE":
      return {
        grandFinal: "double",
      };
    // xxx: resolve from TO setting
    case "RR":
      return {
        groupCount: 4,
      };
    default: {
      assertUnreachable(format);
    }
  }
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

export function HACKY_resolvePoolCode({
  event,
  hostingTeamId,
}: {
  event: TournamentLoaderData["tournament"];
  hostingTeamId: number;
}) {
  const prefix = event.name.includes("In The Zone")
    ? "ITZ"
    : HACKY_isInviteOnlyEvent(event)
      ? "SQ"
      : "PN";
  const lastDigit = hostingTeamId % 10;

  return { prefix, lastDigit };
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

export function everyMatchIsOver(bracket: ValueToArray<DataTypes>) {
  // tournament didn't start yet
  if (bracket.match.length === 0) return false;

  let lastWinner = -1;
  for (const [i, match] of bracket.match.entries()) {
    // special case - bracket reset might not be played depending on who wins in the grands
    const isLast = i === bracket.match.length - 1;
    if (isLast && lastWinner === 1) {
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

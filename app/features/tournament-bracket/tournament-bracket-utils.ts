import type { Stage } from "~/modules/brackets-model";
import type {
  TournamentFormat,
  TournamentMatch,
  TournamentStage,
} from "~/db/types";
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

export function matchIdFromParams(params: Params<string>) {
  const result = Number(params["mid"]);
  invariant(!Number.isNaN(result), "mid is not a number");

  return result;
}

const passNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export function resolveRoomPass(matchId: TournamentMatch["id"]) {
  let result = "";

  for (let i = 0; i < 4; i++) {
    const { shuffle } = seededRandom(`${matchId}-${i}`);

    result += shuffle(passNumbers)[0];
  }

  return result;
}

export function resolveHostingTeam(
  teams: [TournamentLoaderTeam, TournamentLoaderTeam]
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

export function resolveTournamentStageName(format: TournamentFormat) {
  switch (format) {
    case "SE":
    case "DE":
      return "Elimination stage";
    default: {
      assertUnreachable(format);
    }
  }
}

export function resolveTournamentStageType(
  format: TournamentFormat
): TournamentStage["type"] {
  switch (format) {
    case "SE":
      return "single_elimination";
    case "DE":
      return "double_elimination";
    default: {
      assertUnreachable(format);
    }
  }
}

export function resolveTournamentStageSettings(
  format: TournamentFormat
): Stage["settings"] {
  switch (format) {
    case "SE":
      return {};
    case "DE":
      return {
        grandFinal: "double",
        seedOrdering: ["space_between"],
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

export function HACKY_resolvePoolCode(event: TournamentLoaderData["event"]) {
  if (event.name.includes("In The Zone")) return "ITZ";

  return "PICNIC";
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
  let lastWinner = -1;
  for (const [i, match] of bracket.match.entries()) {
    // special case - bracket reset might not be played depending on who wins in the grands
    if (
      match.group_id === 3 &&
      i === bracket.match.length - 1 &&
      lastWinner === 1
    ) {
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

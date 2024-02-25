import type { Params } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Tournament } from "~/db/types";
import type { ModeShort } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { tournamentLogoUrl } from "~/utils/urls";
import type { PlayedSet } from "./core/sets.server";
import { TOURNAMENT } from "./tournament-constants";

export function tournamentIdFromParams(params: Params<string>) {
  const result = Number(params["id"]);
  invariant(!Number.isNaN(result), "id is not a number");

  return result;
}

export function tournamentTeamIdFromParams(params: Params<string>) {
  const result = Number(params["tid"]);
  invariant(!Number.isNaN(result), "tid is not a number");

  return result;
}

export function modesIncluded(
  tournament: Pick<Tournament, "mapPickingStyle">,
): ModeShort[] {
  switch (tournament.mapPickingStyle) {
    case "AUTO_SZ": {
      return ["SZ"];
    }
    case "AUTO_TC": {
      return ["TC"];
    }
    case "AUTO_RM": {
      return ["RM"];
    }
    case "AUTO_CB": {
      return ["CB"];
    }
    default: {
      return [...rankedModesShort];
    }
  }
}

export function isOneModeTournamentOf(
  tournament: Pick<Tournament, "mapPickingStyle">,
) {
  return modesIncluded(tournament).length === 1
    ? modesIncluded(tournament)[0]
    : null;
}

export function HACKY_resolvePicture(event: { name: string }) {
  if (HACKY_isInviteOnlyEvent(event)) {
    return tournamentLogoUrl("sf");
  }

  if (event.name.includes("Paddling Pool")) {
    return tournamentLogoUrl("pp");
  }

  if (event.name.includes("In The Zone")) {
    return tournamentLogoUrl("itz");
  }

  if (event.name.includes("PICNIC")) {
    return tournamentLogoUrl("pn");
  }

  if (event.name.includes("Proving Grounds")) {
    return tournamentLogoUrl("pg");
  }

  if (event.name.includes("Triton")) {
    return tournamentLogoUrl("tc");
  }

  return tournamentLogoUrl("default");
}

const BLACK = "#1e1e1e";
const WHITE = "#fffcfc";
export function HACKY_resolveThemeColors(event: { name: string }) {
  if (HACKY_isInviteOnlyEvent(event)) {
    return { bg: "#1e1e1e", text: WHITE };
  }

  if (event.name.includes("Paddling Pool")) {
    return { bg: "#fff", text: BLACK };
  }

  if (event.name.includes("In The Zone")) {
    return { bg: "#8b0000", text: BLACK };
  }

  if (event.name.includes("PICNIC")) {
    return { bg: "#e3fefe", text: BLACK };
  }

  if (event.name.includes("Proving Grounds")) {
    return { bg: "#ffe809", text: BLACK };
  }

  if (event.name.includes("Triton")) {
    return { bg: "#aee8ff", text: BLACK };
  }

  return { bg: "#3430ad", text: WHITE };
}

const HACKY_isSendouQSeasonFinale = (event: { name: string }) =>
  event.name.includes("Finale");

export function HACKY_isInviteOnlyEvent(event: { name: string }) {
  return HACKY_isSendouQSeasonFinale(event);
}

export function HACKY_maxRosterSizeBeforeStart(event: { name: string }) {
  if (HACKY_isSendouQSeasonFinale(event)) return 5;

  return TOURNAMENT.DEFAULT_TEAM_MAX_MEMBERS_BEFORE_START;
}

export function tournamentRoundI18nKey(round: PlayedSet["round"]) {
  if (round.round === "grand_finals") return `bracket.grand_finals` as const;
  if (round.round === "bracket_reset") {
    return `bracket.grand_finals.bracket_reset` as const;
  }
  if (round.round === "finals") return `bracket.${round.type}.finals` as const;

  return `bracket.${round.type}` as const;
}

export function tournamentTeamMaxSize({
  tournament,
  tournamentHasStarted,
}: {
  tournament: { name: string };
  tournamentHasStarted: boolean;
}) {
  // ensuring every team can add at least one sub while the tournament is ongoing
  return (
    HACKY_maxRosterSizeBeforeStart(tournament) + Number(tournamentHasStarted)
  );
}

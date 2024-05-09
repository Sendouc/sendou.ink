import type { Params } from "@remix-run/react";
import invariant from "tiny-invariant";
import type { Tournament } from "~/db/types";
import type { ModeShort } from "~/modules/in-game-lists";
import { rankedModesShort } from "~/modules/in-game-lists/modes";
import { tournamentLogoUrl } from "~/utils/urls";
import type { PlayedSet } from "./core/sets.server";

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
  const normalizedEventName = event.name.toLowerCase();

  if (normalizedEventName.includes("sendouq")) {
    return tournamentLogoUrl("sf");
  }

  if (normalizedEventName.includes("paddling pool")) {
    return tournamentLogoUrl("pp");
  }

  if (normalizedEventName.includes("in the zone")) {
    return tournamentLogoUrl("itz");
  }

  if (normalizedEventName.includes("picnic")) {
    return tournamentLogoUrl("pn");
  }

  if (normalizedEventName.includes("proving grounds")) {
    return tournamentLogoUrl("pg");
  }

  if (normalizedEventName.includes("triton")) {
    return tournamentLogoUrl("tc");
  }

  if (normalizedEventName.includes("swim or sink")) {
    return tournamentLogoUrl("sos");
  }

  if (normalizedEventName.includes("from the ink up")) {
    return tournamentLogoUrl("ftiu");
  }

  if (normalizedEventName.includes("coral clash")) {
    return tournamentLogoUrl("cc");
  }

  if (normalizedEventName.includes("level up")) {
    return tournamentLogoUrl("lu");
  }

  if (normalizedEventName.includes("all 4 one")) {
    return tournamentLogoUrl("a41");
  }

  if (normalizedEventName.includes("fry basket")) {
    return tournamentLogoUrl("fb");
  }

  if (normalizedEventName.includes("the depths")) {
    return tournamentLogoUrl("d");
  }

  if (normalizedEventName.includes("eclipse")) {
    return tournamentLogoUrl("e");
  }

  if (normalizedEventName.includes("homecoming")) {
    return tournamentLogoUrl("hc");
  }

  if (normalizedEventName.includes("bad ideas")) {
    return tournamentLogoUrl("bio");
  }

  if (normalizedEventName.includes("tenoch")) {
    return tournamentLogoUrl("ai");
  }

  if (normalizedEventName.includes("megalodon monday")) {
    return tournamentLogoUrl("mm");
  }

  if (normalizedEventName.includes("heaven 2 ocean")) {
    return tournamentLogoUrl("ho");
  }

  if (normalizedEventName.includes("kraken royale")) {
    return tournamentLogoUrl("kr");
  }

  if (normalizedEventName.includes("menu royale")) {
    return tournamentLogoUrl("mr");
  }

  if (normalizedEventName.includes("barracuda co")) {
    return tournamentLogoUrl("bc");
  }

  if (normalizedEventName.includes("crimson ink")) {
    return tournamentLogoUrl("ci");
  }

  if (normalizedEventName.includes("mesozoic mayhem")) {
    return tournamentLogoUrl("me");
  }

  if (normalizedEventName.includes("rain or shine")) {
    return tournamentLogoUrl("ros");
  }

  if (normalizedEventName.includes("squid junction")) {
    return tournamentLogoUrl("sj");
  }

  if (normalizedEventName.includes("silly sausage")) {
    return tournamentLogoUrl("ss");
  }

  if (normalizedEventName.includes("united-lan")) {
    return tournamentLogoUrl("ul");
  }

  if (normalizedEventName.includes("soul cup")) {
    return tournamentLogoUrl("sc");
  }

  return tournamentLogoUrl("default");
}

const BLACK = "#1e1e1e";
const WHITE = "#fffcfc";
export function HACKY_resolveThemeColors(event: { name: string }) {
  const normalizedEventName = event.name.toLowerCase();

  if (normalizedEventName.includes("sendouq")) {
    return { bg: "#1e1e1e", text: WHITE };
  }

  if (normalizedEventName.includes("paddling pool")) {
    return { bg: "#fff", text: BLACK };
  }

  if (normalizedEventName.includes("in the zone")) {
    return { bg: "#8b0000", text: WHITE };
  }

  if (normalizedEventName.includes("picnic")) {
    return { bg: "#e3fefe", text: BLACK };
  }

  if (normalizedEventName.includes("proving grounds")) {
    return { bg: "#ffe809", text: BLACK };
  }

  if (normalizedEventName.includes("triton")) {
    return { bg: "#aee8ff", text: BLACK };
  }

  if (normalizedEventName.includes("swim or sink")) {
    return { bg: "#d7f8ea", text: BLACK };
  }

  if (normalizedEventName.includes("from the ink up")) {
    return { bg: "#ffdfc6", text: BLACK };
  }

  if (normalizedEventName.includes("coral clash")) {
    return { bg: "#f0f4ff", text: BLACK };
  }

  if (normalizedEventName.includes("level up")) {
    return { bg: "#383232", text: WHITE };
  }

  if (normalizedEventName.includes("all 4 one")) {
    return { bg: "#2b262a", text: WHITE };
  }

  if (normalizedEventName.includes("fry basket")) {
    return { bg: "#fff", text: BLACK };
  }

  if (normalizedEventName.includes("the depths")) {
    return { bg: "#183e42", text: WHITE };
  }

  if (normalizedEventName.includes("eclipse")) {
    return { bg: "#191919", text: WHITE };
  }

  if (normalizedEventName.includes("homecoming")) {
    return { bg: "#1c1c1c", text: WHITE };
  }

  if (normalizedEventName.includes("bad ideas")) {
    return { bg: "#000000", text: WHITE };
  }

  if (normalizedEventName.includes("tenoch")) {
    return { bg: "#425969", text: WHITE };
  }

  if (normalizedEventName.includes("megalodon monday")) {
    return { bg: "#288eb5", text: WHITE };
  }

  if (normalizedEventName.includes("heaven 2 ocean")) {
    return { bg: "#8cf1ff", text: BLACK };
  }

  if (normalizedEventName.includes("kraken royale")) {
    return { bg: "#32333a", text: WHITE };
  }

  if (normalizedEventName.includes("menu royale")) {
    return { bg: "#000", text: WHITE };
  }

  if (normalizedEventName.includes("barracuda co")) {
    return { bg: "#47b6fe", text: BLACK };
  }

  if (normalizedEventName.includes("crimson ink")) {
    return { bg: "#000000", text: WHITE };
  }

  if (normalizedEventName.includes("mesozoic mayhem")) {
    return { bg: "#ccd5da", text: BLACK };
  }

  if (normalizedEventName.includes("rain or shine")) {
    return { bg: "#201c3b", text: WHITE };
  }

  if (normalizedEventName.includes("squid junction")) {
    return { bg: "#fed09f", text: BLACK };
  }

  if (normalizedEventName.includes("silly sausage")) {
    return { bg: "#ffd76f", text: BLACK };
  }

  if (normalizedEventName.includes("united-lan")) {
    return { bg: "#fff", text: BLACK };
  }

  if (normalizedEventName.includes("soul cup")) {
    return { bg: "#101011", text: WHITE };
  }

  return { bg: "#3430ad", text: WHITE };
}

export function tournamentRoundI18nKey(round: PlayedSet["round"]) {
  if (round.round === "grand_finals") return `bracket.grand_finals`;
  if (round.round === "bracket_reset") {
    return `bracket.grand_finals.bracket_reset`;
  }
  if (round.round === "finals") return `bracket.${round.type}.finals` as const;

  return `bracket.${round.type}` as const;
}

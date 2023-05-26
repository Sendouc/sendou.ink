import type { User } from "~/db/types";
import type { ModeShort } from "~/modules/in-game-lists";
// import { setHistoryByTeamId } from "../queries/setHistoryByTeamId.server";

export interface PlayedSet {
  tournamentMatchId: number;
  score: [teamBeingViewed: number, opponent: number];
  round: {
    type: "winners" | "losers" | "single_elim";
    round: number | "finals" | "grand_finals" | "bracket_reset";
  };
  bracket: "main" | "underground";
  maps: Array<{
    modeShort: ModeShort;
    result: "win" | "loss";
  }>;
  opponent: {
    id: number;
    name: string;
    /** Team's roster that played in this set */
    roster: Array<
      Pick<
        User,
        "id" | "discordName" | "discordAvatar" | "discordId" | "customUrl"
      >
    >;
  };
}

export function tournamentTeamSets(_tournamentTeamId: number): PlayedSet[] {
  // const sets = setHistoryByTeamId(tournamentTeamId);
  return [];
}

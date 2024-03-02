import type { z } from "zod";
import { isAdmin } from "~/permissions";
import type { TournamentSettings } from "~/db/tables";
import { BRACKET_NAMES } from "../tournament/tournament-constants";
import type { newCalendarEventActionSchema } from "./calendar-schemas.server";
import { validateFollowUpBrackets } from "./calendar-utils";

const usersWithTournamentPerms =
  process.env["TOURNAMENT_PERMS"]?.split(",").map(Number) ?? [];
export function canCreateTournament(user?: { id: number }) {
  if (!user) return false;

  return isAdmin(user) || usersWithTournamentPerms.includes(user.id);
}

export function formValuesToBracketProgression(
  args: z.infer<typeof newCalendarEventActionSchema>,
) {
  if (!args.format) return null;

  const result: TournamentSettings["bracketProgression"] = [];
  if (args.format === "DE") {
    result.push({
      name: BRACKET_NAMES.MAIN,
      type: "double_elimination",
    });

    if (args.withUndergroundBracket) {
      result.push({
        name: BRACKET_NAMES.UNDERGROUND,
        type: "single_elimination",
        sources: [{ bracketIdx: 0, placements: [-1, -2] }],
      });
    }
  }

  if (
    args.format === "RR_TO_SE" &&
    args.teamsPerGroup &&
    args.followUpBrackets
  ) {
    if (validateFollowUpBrackets(args.followUpBrackets, args.teamsPerGroup)) {
      return null;
    }

    result.push({
      name: BRACKET_NAMES.GROUPS,
      type: "round_robin",
    });

    for (const bracket of args.followUpBrackets) {
      result.push({
        name: bracket.name,
        type: "single_elimination",
        sources: [{ bracketIdx: 0, placements: bracket.placements }],
      });
    }
  }

  // should not happen
  if (result.length === 0) return null;

  return result;
}

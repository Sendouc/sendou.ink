import type { z } from "zod";
import { isAdmin } from "~/permissions";
import type { TournamentSettings } from "~/db/tables";
import { BRACKET_NAMES } from "../tournament/tournament-constants";
import { nullFilledArray } from "~/utils/arrays";
import type { newCalendarEventActionSchema } from "./calendar-schemas.server";

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
    args.advancingCount &&
    args.teamsPerGroup &&
    args.advancingCount <= args.teamsPerGroup
  ) {
    result.push({
      name: BRACKET_NAMES.GROUPS,
      type: "round_robin",
    });

    const allPlacements = nullFilledArray(args.teamsPerGroup).map(
      (_, i) => i + 1,
    );
    const advancingPlacements = nullFilledArray(args.advancingCount).map(
      (_, i) => i + 1,
    );

    result.push({
      name: BRACKET_NAMES.FINALS,
      type: "single_elimination",
      sources: [
        {
          bracketIdx: 0,
          placements: advancingPlacements,
        },
      ],
    });

    if (
      args.withUndergroundBracket &&
      advancingPlacements.length !== allPlacements.length
    ) {
      result.push({
        name: BRACKET_NAMES.UNDERGROUND,
        type: "single_elimination",
        sources: [
          {
            bracketIdx: 0,
            placements: allPlacements.filter(
              (p) => !advancingPlacements.includes(p),
            ),
          },
        ],
      });
    }
  }

  // should not happen
  if (result.length === 0) return null;

  return result;
}

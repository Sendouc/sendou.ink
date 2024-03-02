import type { TournamentSettings } from "~/db/tables";
import { userDiscordIdIsAged } from "~/utils/users";
import type { TournamentFormatShort } from "../tournament/tournament-constants";
import type { FollowUpBracket } from "./calendar-types";

export const canAddNewEvent = (user: { discordId: string }) =>
  userDiscordIdIsAged(user);

export function bracketProgressionToShortTournamentFormat(
  bp: TournamentSettings["bracketProgression"],
): TournamentFormatShort {
  if (bp.some((b) => b.type === "double_elimination")) return "DE";

  return "RR_TO_SE";
}

export const calendarEventMinDate = () => new Date(Date.UTC(2015, 4, 28));
export const calendarEventMaxDate = () => {
  const result = new Date();
  result.setFullYear(result.getFullYear() + 1);
  return result;
};

export function validateFollowUpBrackets(
  brackets: FollowUpBracket[],
  teamsPerGroup: number,
) {
  const placementsFound: number[] = [];

  for (const bracket of brackets) {
    for (const placement of bracket.placements) {
      if (placementsFound.includes(placement)) {
        return `Duplicate group placement for two different brackets: ${placement}`;
      }
      placementsFound.push(placement);
    }
  }

  for (
    let placement = 1;
    placement <= Math.max(...placementsFound);
    placement++
  ) {
    if (!placementsFound.includes(placement)) {
      return `No bracket for placement ${placement}`;
    }
  }

  if (placementsFound.some((p) => p > teamsPerGroup)) {
    return `Placement higher than teams per group`;
  }

  if (brackets.some((b) => !b.name)) {
    return "Bracket name can't be empty";
  }

  if (brackets.some((b) => b.placements.length === 0)) {
    return "Bracket must have at least one placement";
  }

  if (new Set(brackets.map((b) => b.name)).size !== brackets.length) {
    return "Duplicate bracket name";
  }

  return null;
}

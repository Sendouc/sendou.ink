import type { TournamentSettings } from "~/db/tables";
import { userDiscordIdIsAged } from "~/utils/users";
import type { TournamentFormatShort } from "../tournament/tournament-constants";

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

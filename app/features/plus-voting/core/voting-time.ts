import type { MonthYear } from "~/features/top-search/top-search-utils";
import {
  seasonToVotingRange,
  lastCompletedVoting as lastCompletedVotingNew,
} from "./voting-time-new"; // TODO: seasonToVotingRange can be removed as export after the first new voting under the new system
import { lastCompletedVoting as lastCompletedVotingOld } from "./voting-time-old";

export {
  isVotingActive,
  nextNonCompletedVoting,
  rangeToMonthYear,
} from "./voting-time-new";

// TODO: this can be removed after the first new voting under the new system
export function lastCompletedVoting(now: Date): MonthYear {
  const range = seasonToVotingRange({
    nth: 1,
    starts: new Date("2023-09-11T17:00:00.000Z"),
    ends: new Date("2023-11-19T20:59:59.999Z"),
  });

  // first voting under the new system has not yet concluded
  const usingOldLogic = range.endDate.getTime() > now.getTime();

  return usingOldLogic
    ? lastCompletedVotingOld(now)
    : lastCompletedVotingNew(now);
}

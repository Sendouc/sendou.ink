import { rating, rate as openskillRate } from "openskill";
import { findCurrentSkillByUserId } from "./queries/findCurrentSkillByUserId.server";
import type { Team } from "openskill/dist/types";
import { findCurrentTeamSkillByIdentifier } from "./queries/findCurrentTeamSkillByIdentifier.server";
import invariant from "tiny-invariant";

const TAU = 0.3;

export function ordinalToSp(ordinal: number) {
  return toTwoDecimals(ordinal * 10 + 1000);
}

function toTwoDecimals(value: number) {
  return Number(value.toFixed(2));
}

export function queryCurrentUserRating(userId: number) {
  const skill = findCurrentSkillByUserId(userId);

  if (!skill) {
    return rating();
  }

  return rating(skill);
}

export function queryCurrentTeamRating(identifier: string) {
  const skill = findCurrentTeamSkillByIdentifier(identifier);

  if (!skill) {
    return rating();
  }

  return rating(skill);
}

export function rate(teams: Team[]) {
  return openskillRate(teams, { tau: TAU, preventSigmaIncrease: true });
}

export function userIdsToIdentifier(userIds: number[]) {
  invariant(userIds.length === 4, "userIds for identifier must be length 4");
  return [...userIds].sort((a, b) => a - b).join("-");
}

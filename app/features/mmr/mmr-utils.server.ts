import { rating } from "openskill";
import { findCurrentSkillByUserId } from "./queries/findCurrentSkillByUserId.server";
import { findCurrentTeamSkillByIdentifier } from "./queries/findCurrentTeamSkillByIdentifier.server";

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

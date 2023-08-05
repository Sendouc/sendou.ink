import { rating } from "openskill";
import { findCurrentSkillByUserId } from "./queries/findCurrentSkillByUserId.server";
import { findCurrentTeamSkillByIdentifier } from "./queries/findCurrentTeamSkillByIdentifier.server";

export function queryCurrentUserRating({
  userId,
  season,
}: {
  userId: number;
  season?: number | null;
}) {
  const skill = findCurrentSkillByUserId({ userId, season: season ?? null });

  if (!skill) {
    return rating();
  }

  return rating(skill);
}

export function queryCurrentTeamRating({
  identifier,
  season,
}: {
  identifier: string;
  season?: number | null;
}) {
  const skill = findCurrentTeamSkillByIdentifier({
    identifier,
    season: season ?? null,
  });

  // xxx: base initial rating on user ratings
  if (!skill) {
    return rating();
  }

  return rating(skill);
}

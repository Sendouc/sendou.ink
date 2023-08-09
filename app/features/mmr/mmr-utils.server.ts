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

// xxx: remove specific logic here and make it so that rating compares team rating to player average and gives you the most favorable end result
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

  if (!skill) return rating();

  return rating(skill);
}
